import '~/styles'
import './Exporter.scss'
import React, { useEffect } from 'react'
import { ExportedData, ExportType } from '~/exporter/types'
import { DashboardPlacement } from '~/types'
import { ExportedInsight } from '~/exporter/ExportedInsight/ExportedInsight'
import { FriendlyLogo } from '~/toolbar/assets/FriendlyLogo'
import { Dashboard } from 'scenes/dashboard/Dashboard'
import { useResizeObserver } from 'lib/hooks/useResizeObserver'
import clsx from 'clsx'

export function Exporter(props: ExportedData): JSX.Element {
    const { type, dashboard, insight, team, ...exportOptions } = props
    const { whitelabel } = exportOptions

    const { ref: elementRef, height, width } = useResizeObserver()

    useEffect(() => {
        // NOTE: For embedded views we emit an event to indicate the content width / height to allow the parent to correctly resize
        // NOTE: We post the window name to allow the parent to identify the iframe
        window.parent?.postMessage({ event: 'posthog:dimensions', name: window.name, height, width }, '*')
    }, [height, width])

    return (
        <div
            className={clsx('Exporter', {
                'Export--insight': !!insight,
                'Export--dashboard': !!dashboard,
            })}
            ref={elementRef}
        >
            {!whitelabel && dashboard ? (
                type === ExportType.Scene ? (
                    <div className="SharedDashboard-header">
                        <a href="https://posthog.com" target="_blank" rel="noopener noreferrer">
                            <FriendlyLogo style={{ fontSize: '1.125rem' }} />
                        </a>
                        <div className="SharedDashboard-header-title">
                            <h1 className="mb-2" data-attr="dashboard-item-title">
                                {dashboard.name}
                            </h1>
                            <span>{dashboard.description}</span>
                        </div>
                        <span className="SharedDashboard-header-team">{team?.name}</span>
                    </div>
                ) : type === ExportType.Embed ? (
                    <a
                        href="https://posthog.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', marginBottom: '-2.5rem' }}
                    >
                        <FriendlyLogo style={{ fontSize: '1.125rem' }} />
                    </a>
                ) : type === ExportType.Image ? (
                    <>
                        <h1 className="mb-2">{dashboard.name}</h1>
                        <p>{dashboard.description}</p>
                    </>
                ) : null
            ) : null}

            {insight ? (
                <ExportedInsight type={type} insight={insight} exportOptions={exportOptions} />
            ) : dashboard ? (
                <Dashboard
                    id={String(dashboard.id)}
                    dashboard={dashboard}
                    placement={type === ExportType.Image ? DashboardPlacement.Export : DashboardPlacement.Public}
                />
            ) : (
                <h1 className="text-center p-4">Something went wrong...</h1>
            )}

            {!whitelabel && dashboard && (
                <div className="text-center pb-4">
                    {type === ExportType.Image ? <FriendlyLogo style={{ fontSize: '1.125rem' }} /> : null}
                    <div>
                        Made with{' '}
                        <a
                            href="https://posthog.com?utm_medium=in-product&utm_campaign=shared-dashboard"
                            target="_blank"
                            rel="noopener"
                        >
                            PostHog – open-source product analytics
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
