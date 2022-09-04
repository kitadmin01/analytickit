import {
  AnalyticKitCore,
  AnalyticKitFetchOptions,
  AnalyticKitFetchResponse,
  AnalyticKitPersistedProperty,
} from '../../analytickit-core/src'
import { getContext } from './context'
import { AnalyticKitStorage, getStorage } from './storage'
import { version } from '../package.json'
import { AnalyticKitOptions } from './types'

export class AnalyticKit extends AnalyticKitCore {
  private _storage: AnalyticKitStorage
  private _storageCache: any
  private _storageKey: string

  constructor(apiKey: string, options?: AnalyticKitOptions) {
    super(apiKey, options)

    // analytickit-js stores options in one object on
    this._storageKey = options?.persistence_name ? `ph_${options.persistence_name}` : `ph_${apiKey}_analytickit`
    this._storage = getStorage(options?.persistence || 'localStorage')
  }

  getPersistedProperty<T>(key: AnalyticKitPersistedProperty): T | undefined {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || '{}') || {}
    }

    return this._storageCache[key]
  }

  setPersistedProperty<T>(key: AnalyticKitPersistedProperty, value: T | null): void {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || '{}') || {}
    }

    if (value === null) {
      delete this._storageCache[key]
    } else {
      this._storageCache[key] = value
    }

    this._storage.setItem(this._storageKey, JSON.stringify(this._storageCache))
  }

  fetch(url: string, options: AnalyticKitFetchOptions): Promise<AnalyticKitFetchResponse> {
    return window.fetch(url, options)
  }
  getLibraryId(): string {
    return 'analytickit-js-lite'
  }
  getLibraryVersion(): string {
    return version
  }
  getCustomUserAgent(): void {
    return
  }

  getCommonEventProperties(): any {
    return {
      ...super.getCommonEventProperties(),
      ...getContext(window),
    }
  }
}
