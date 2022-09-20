import { version } from  '../package.json'
import undici from '../lib/index'
import {
  AnalyticKitCore,
  AnalytickitCoreOptions,
  AnalyticKitFetchOptions,
  AnalyticKitFetchResponse,
  AnalyticKitPersistedProperty,
} from '../lib/analytickit-core/src'
import { AnalyticKitMemoryStorage } from '../lib/analytickit-core/src/storage-memory'
import { EventMessageV1, GroupIdentifyMessage, IdentifyMessageV1, AnalyticKitNodeV1 } from 'analytickit-node/src/types'
import { FeatureFlagsPoller } from 'analytickit-node/src/feature-flags'

export type AnalyticKitOptions = AnalytickitCoreOptions & {
  persistence?: 'memory'
  personalApiKey?: string
  // The interval in milliseconds between polls for refreshing feature flag definitions
  featureFlagsPollingInterval?: number
  // Timeout in milliseconds for feature flag definitions calls. Defaults to 30 seconds.
  requestTimeout?: number
  // Maximum size of cache that deduplicates $feature_flag_called calls per user.
  maxCacheSize?: number
}

const THIRTY_SECONDS = 30 * 1000
const MAX_CACHE_SIZE = 50 * 1000

class AnalyticKit extends AnalyticKitCore {
  private _memoryStorage = new AnalyticKitMemoryStorage()

  constructor(apiKey: string, options: AnalyticKitOptions = {}) {
    options.captureMode = options?.captureMode || 'json'
    options.preloadFeatureFlags = false // Don't preload as this makes no sense without a distinctId
    options.sendFeatureFlagEvent = false // Let `analytickit-node` handle this on its own, since we're dealing with multiple distinctIDs

    super(apiKey, options)
  }

  getPersistedProperty(key: AnalyticKitPersistedProperty): any | undefined {
    return this._memoryStorage.getProperty(key)
  }

  setPersistedProperty(key: AnalyticKitPersistedProperty, value: any | null): void {
    return this._memoryStorage.setProperty(key, value)
  }

  getSessionId(): string | undefined {
    // Sessions don't make sense for Node
    return undefined
  }

  fetch(url: string, options: AnalyticKitFetchOptions): Promise<AnalyticKitFetchResponse> {
    return undici.fetch(url, options)
  }

  getLibraryId(): string {
    return 'analytickit-node'
  }
  getLibraryVersion(): string {
    return version
  }
  getCustomUserAgent(): string {
    return `analytickit-node/${version}`
  }
}

// The actual exported Nodejs API.
export class AnalyticKitGlobal implements AnalyticKitNodeV1 {
  private _sharedClient: AnalyticKit
  private featureFlagsPoller?: FeatureFlagsPoller
  private maxCacheSize: number

  distinctIdHasSentFlagCalls: Record<string, string[]>

  constructor(apiKey: string, options: AnalyticKitOptions = {}) {
    this._sharedClient = new AnalyticKit(apiKey, options)
    if (options.personalApiKey) {
      this.featureFlagsPoller = new FeatureFlagsPoller({
        pollingInterval:
          typeof options.featureFlagsPollingInterval === 'number'
            ? options.featureFlagsPollingInterval
            : THIRTY_SECONDS,
        personalApiKey: options.personalApiKey,
        projectApiKey: apiKey,
        timeout: options.requestTimeout,
        host: this._sharedClient.host,
      })
    }
    this.distinctIdHasSentFlagCalls = {}
    this.maxCacheSize = options.maxCacheSize || MAX_CACHE_SIZE
  }

  private reInit(distinctId: string): void {
    // Certain properties we want to persist. Queue is persisted always by default.
    this._sharedClient.reset([AnalyticKitPersistedProperty.OptedOut])
    this._sharedClient.setPersistedProperty(AnalyticKitPersistedProperty.DistinctId, distinctId)
  }

  enable(): void {
    return this._sharedClient.optIn()
  }

  disable(): void {
    return this._sharedClient.optOut()
  }

  capture({ distinctId, event, properties, groups, sendFeatureFlags }: EventMessageV1): void {
    this.reInit(distinctId)
    if (groups) {
      this._sharedClient.groups(groups)
    }
    this._sharedClient.capture(event, properties, sendFeatureFlags || false)
  }

  identify({ distinctId, properties }: IdentifyMessageV1): void {
    this.reInit(distinctId)
    this._sharedClient.identify(distinctId, properties)
  }

  alias(data: { distinctId: string; alias: string }): void {
    this.reInit(data.distinctId)
    this._sharedClient.alias(data.alias)
  }

  async getFeatureFlag(
    key: string,
    distinctId: string,
    options?: {
      groups?: Record<string, string>
      personProperties?: Record<string, string>
      groupProperties?: Record<string, Record<string, string>>
      onlyEvaluateLocally?: boolean
      sendFeatureFlagEvents?: boolean
    }
  ): Promise<string | boolean | undefined> {
    const { groups, personProperties, groupProperties } = options || {}
    let { onlyEvaluateLocally, sendFeatureFlagEvents } = options || {}

    // set defaults
    if (onlyEvaluateLocally == undefined) {
      onlyEvaluateLocally = false
    }
    if (sendFeatureFlagEvents == undefined) {
      sendFeatureFlagEvents = true
    }

    let response = await this.featureFlagsPoller?.getFeatureFlag(
      key,
      distinctId,
      groups,
      personProperties,
      groupProperties
    )

    const flagWasLocallyEvaluated = response !== undefined

    if (!flagWasLocallyEvaluated && !onlyEvaluateLocally) {
      this.reInit(distinctId)
      if (groups != undefined) {
        this._sharedClient.groups(groups)
      }

      if (personProperties) {
        this._sharedClient.personProperties(personProperties)
      }

      if (groupProperties) {
        this._sharedClient.groupProperties(groupProperties)
      }
      await this._sharedClient.reloadFeatureFlagsAsync(false)
      response = this._sharedClient.getFeatureFlag(key)
    }

    const featureFlagReportedKey = `${key}_${response}`

    if (
      sendFeatureFlagEvents &&
      (!(distinctId in this.distinctIdHasSentFlagCalls) ||
        !this.distinctIdHasSentFlagCalls[distinctId].includes(featureFlagReportedKey))
    ) {
      if (Object.keys(this.distinctIdHasSentFlagCalls).length >= this.maxCacheSize) {
        this.distinctIdHasSentFlagCalls = {}
      }
      if (Array.isArray(this.distinctIdHasSentFlagCalls[distinctId])) {
        this.distinctIdHasSentFlagCalls[distinctId].push(featureFlagReportedKey)
      } else {
        this.distinctIdHasSentFlagCalls[distinctId] = [featureFlagReportedKey]
      }
      this.capture({
        distinctId,
        event: '$feature_flag_called',
        properties: {
          $feature_flag: key,
          $feature_flag_response: response,
          locally_evaluated: flagWasLocallyEvaluated,
        },
        groups,
      })
    }
    return response
  }

  async isFeatureEnabled(
    key: string,
    distinctId: string,
    options?: {
      groups?: Record<string, string>
      personProperties?: Record<string, string>
      groupProperties?: Record<string, Record<string, string>>
      onlyEvaluateLocally?: boolean
      sendFeatureFlagEvents?: boolean
    }
  ): Promise<boolean | undefined> {
    const feat = await this.getFeatureFlag(key, distinctId, options)
    if (feat === undefined) {
      return undefined
    }
    return !!feat || false
  }

  async getAllFlags(
    distinctId: string,
    options?: {
      groups?: Record<string, string>
      personProperties?: Record<string, string>
      groupProperties?: Record<string, Record<string, string>>
      onlyEvaluateLocally?: boolean
    }
  ): Promise<Record<string, string | boolean>> {
    const { groups, personProperties, groupProperties } = options || {}
    let { onlyEvaluateLocally } = options || {}

    // set defaults
    if (onlyEvaluateLocally == undefined) {
      onlyEvaluateLocally = false
    }

    const localEvaluationResult = await this.featureFlagsPoller?.getAllFlags(
      distinctId,
      groups,
      personProperties,
      groupProperties
    )

    let response = {}
    let fallbackToDecide = true
    if (localEvaluationResult) {
      response = localEvaluationResult.response
      fallbackToDecide = localEvaluationResult.fallbackToDecide
    }

    if (fallbackToDecide && !onlyEvaluateLocally) {
      this.reInit(distinctId)
      if (groups) {
        this._sharedClient.groups(groups)
      }

      if (personProperties) {
        this._sharedClient.personProperties(personProperties)
      }

      if (groupProperties) {
        this._sharedClient.groupProperties(groupProperties)
      }
      await this._sharedClient.reloadFeatureFlagsAsync(false)
      const remoteEvaluationResult = this._sharedClient.getFeatureFlags()

      return { ...response, ...remoteEvaluationResult }
    }

    return response
  }

  groupIdentify({ groupType, groupKey, properties }: GroupIdentifyMessage): void {
    this._sharedClient.groupIdentify(groupType, groupKey, properties)
  }

  async reloadFeatureFlags(): Promise<void> {
    await this.featureFlagsPoller?.loadFeatureFlags(true)
  }

  flush(): void {
    this._sharedClient.flush()
  }

  shutdown(): void {
    void this.shutdownAsync()
  }

  async shutdownAsync(): Promise<void> {
    this.featureFlagsPoller?.stopPoller()
    return this._sharedClient.shutdownAsync()
  }

  debug(enabled?: boolean): void {
    return this._sharedClient.debug(enabled)
  }
}
