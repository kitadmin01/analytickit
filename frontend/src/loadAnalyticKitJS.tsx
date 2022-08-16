import analytickit, { analytickitConfig } from 'analytickit-js'
import * as Sentry from '@sentry/react'
import { Integration } from '@sentry/types'

const configWithSentry = (config: Partial<analytickitConfig>): Partial<analytickitConfig> => {
    if ((window as any).SENTRY_DSN) {
        config.on_xhr_error = (failedRequest: XMLHttpRequest) => {
            const status = failedRequest.status
            const statusText = failedRequest.statusText || 'no status text in error'
            Sentry.captureException(
                new Error(`Failed with status ${status} while sending to analytickit. Message: ${statusText}`),
                { tags: { status, statusText } }
            )
        }
    }
    return config
}

export function loadanalytickitJS(): void {
    if (window.JS_analytickit_API_KEY) {
        analytickit.init(
            window.JS_analytickit_API_KEY,
            configWithSentry({
                api_host: window.JS_analytickit_HOST,
                _capture_metrics: true,
                rageclick: true,
                debug: window.JS_analytickit_SELF_CAPTURE,
                persistence: 'localStorage+cookie',
                _capture_performance: true,
                enable_recording_console_log: true,
            })
        )
        // Make sure we have access to the object in window for debugging
        window.analytickit = analytickit
    } else {
        analytickit.init(
            'fake token',
            configWithSentry({
                autocapture: false,
                loaded: function (ph) {
                    ph.opt_out_capturing()
                },
            })
        )
    }

    if ((window as any).SENTRY_DSN) {
        Sentry.init({
            dsn: (window as any).SENTRY_DSN,
            ...(window.location.host.indexOf('app.analytickit.com') > -1 && {
                integrations: [new analytickit.SentryIntegration(analytickit, 'analytickit2', 1899813) as Integration],
            }),
        })
    }
}
