/**
 * Integrate Sentry with AnalyticKit. This will add a direct link to the person in Sentry, and an $exception event in AnalyticKit
 *
 * ### Usage
 *
 *     Sentry.init({
 *          dsn: 'https://example',
 *          integrations: [
 *              new analytickit.SentryIntegration(analytickit)
 *          ]
 *     })
 *
 * @param {Object} [analytickit] The analytickit object
 * @param {string} [organization] Optional: The Sentry organization, used to send a direct link from AnalyticKit to Sentry
 * @param {Number} [projectId] Optional: The Sentry project id, used to send a direct link from AnalyticKit to Sentry
 * @param {string} [prefix] Optional: Url of a self-hosted sentry instance (default: https://sentry.io/organizations/)
 */
import { EventProcessor, Hub, Integration } from '@sentry/types'
import { Properties } from '../types'
import { AnalyticKit } from '../analytickit-core'

export class SentryIntegration implements Integration {
    name: string
    setupOnce: (addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub) => void

    constructor(_analytickit: AnalyticKit, organization?: string, projectId?: number, prefix?: string) {
        // setupOnce gets called by Sentry when it intializes the plugin
        // 'this' is not this: AnalyticKitLib object, but the new class that's created.
        // TODO: refactor to a real class. The types
        this.name = 'analytickit-js'
        this.setupOnce = function (addGlobalEventProcessor: (callback: EventProcessor) => void) {
            addGlobalEventProcessor((event) => {
                if (event.level !== 'error' || !_analytickit.__loaded) return event
                if (!event.tags) event.tags = {}
                event.tags['AnalyticKit Person URL'] =
                    _analytickit.config.api_host + '/person/' + _analytickit.get_distinct_id()
                if (_analytickit.sessionRecordingStarted()) {
                    event.tags['AnalyticKit Recording URL'] =
                        _analytickit.config.api_host +
                        '/recordings/#sessionRecordingId=' +
                        _analytickit.sessionManager.checkAndGetSessionAndWindowId(true).sessionId
                }
                const data: Properties = {
                    $sentry_event_id: event.event_id,
                    $sentry_exception: event.exception,
                }
                if (organization && projectId)
                    data['$sentry_url'] =
                        (prefix || 'https://sentry.io/organizations/') +
                        organization +
                        '/issues/?project=' +
                        projectId +
                        '&query=' +
                        event.event_id
                _analytickit.capture('$exception', data)
                return event
            })
        }
    }
}
