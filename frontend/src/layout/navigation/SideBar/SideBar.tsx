import clsx from 'clsx'
import { useActions, useValues } from 'kea'
import { Link } from 'lib/components/Link'
import React, { useState } from 'react'
import { ProjectSwitcherOverlay } from '~/layout/navigation/ProjectSwitcher'
import {
    IconApps,
    IconBarChart,
    IconCoffee,
    IconCohort,
    IconComment,
    IconExperiment,
    IconFlag,
    IconGauge,
    IconLive,
    IconOpenInApp,
    IconPerson,
    IconPin,
    IconPlus,
    IconRecording,
    IconSettings,
    IconTools,
    UnverifiedEvent,
    IconCrypto,
} from 'lib/components/icons'
import { LemonDivider } from 'lib/components/LemonDivider'
import { Lettermark } from 'lib/components/Lettermark/Lettermark'
import { dashboardsModel } from '~/models/dashboardsModel'
import { organizationLogic } from '~/scenes/organizationLogic'
import { canViewPlugins } from '~/scenes/plugins/access'
import { Scene } from '~/scenes/sceneTypes'
import { teamLogic } from '~/scenes/teamLogic'
import { urls } from '~/scenes/urls'
import { AvailableFeature } from '~/types'
import './SideBar.scss'
import { navigationLogic } from '../navigationLogic'
import { FEATURE_FLAGS } from 'lib/constants'
import { featureFlagLogic } from 'lib/logic/featureFlagLogic'
import { groupsModel } from '~/models/groupsModel'
import { userLogic } from 'scenes/userLogic'
import { preflightLogic } from 'scenes/PreflightCheck/preflightLogic'
import { SideBarApps } from '~/layout/navigation/SideBar/SideBarApps'
import { PageButton } from '~/layout/navigation/SideBar/PageButton'
import { frontendAppsLogic } from 'scenes/apps/frontendAppsLogic'
import { authorizedUrlsLogic } from 'scenes/toolbar-launch/authorizedUrlsLogic'
import { LemonButton } from 'lib/components/LemonButton'
import { Tooltip } from 'lib/components/Tooltip'
import Typography from 'antd/lib/typography'

function Pages(): JSX.Element {
    const { currentOrganization } = useValues(organizationLogic)
    const { hideSideBarMobile, toggleProjectSwitcher, hideProjectSwitcher } = useActions(navigationLogic)
    const { isProjectSwitcherShown } = useValues(navigationLogic)
    const { pinnedDashboards } = useValues(dashboardsModel)
    const { featureFlags } = useValues(featureFlagLogic)
    const { showGroupsOptions } = useValues(groupsModel)
    const { hasAvailableFeature } = useValues(userLogic)
    const { preflight } = useValues(preflightLogic)
    const { currentTeam } = useValues(teamLogic)
    const { frontendApps } = useValues(frontendAppsLogic)
    const { appUrls, launchUrl } = useValues(authorizedUrlsLogic)

    const [arePinnedDashboardsShown, setArePinnedDashboardsShown] = useState(false)
    const [isToolbarLaunchShown, setIsToolbarLaunchShown] = useState(false)

    return (
        <ul>
            <div className="SideBar__heading">Campaign</div>
            <PageButton
                data-tooltip="project-button"
                title={currentTeam?.name ?? 'Choose campaign'}
                icon={<Lettermark name={currentOrganization?.name} />}
                identifier={Scene.ProjectHomepage}
                to={urls.projectHomepage()}
                sideAction={{
                    'aria-label': 'switch campaign',
                    onClick: () => toggleProjectSwitcher(),
                    popup: {
                        visible: isProjectSwitcherShown,
                        onClickOutside: hideProjectSwitcher,
                        overlay: <ProjectSwitcherOverlay />,
                        actionable: true,
                    },
                }}
            />
            {currentTeam && (
                <>
                    <LemonDivider />
                    <PageButton
                        icon={<IconGauge />}
                        identifier={Scene.Dashboards}
                        to={urls.dashboards()}
                        sideAction={{
                            identifier: 'pinned-dashboards',
                            tooltip: 'Pinned dashboards',
                            onClick: () => setArePinnedDashboardsShown((state) => !state),
                            popup: {
                                visible: arePinnedDashboardsShown,
                                onClickOutside: () => setArePinnedDashboardsShown(false),
                                onClickInside: hideSideBarMobile,
                                overlay: (
                                    <div className="SideBar__side-actions" data-attr="sidebar-pinned-dashboards">
                                        <h5>Pinned dashboards</h5>
                                        <LemonDivider />
                                        {pinnedDashboards.length > 0 ? (
                                            <ul className="m-0 p-0 list-none">
                                                {pinnedDashboards.map((dashboard) => (
                                                    <PageButton
                                                        key={dashboard.id}
                                                        title={dashboard.name || <i>Untitled</i>}
                                                        identifier={dashboard.id}
                                                        onClick={() => setArePinnedDashboardsShown(false)}
                                                        to={urls.dashboard(dashboard.id)}
                                                    />
                                                ))}
                                            </ul>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <IconPin className="text-2xl text-muted-alt" />
                                                    <div>
                                                        <Link
                                                            onClick={() => setArePinnedDashboardsShown(false)}
                                                            to={urls.dashboards()}
                                                        >
                                                            Pin some dashboards
                                                        </Link>
                                                        <br />
                                                        for them to show up here
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        }}
                    />
                    <PageButton
                        icon={<IconBarChart />}
                        identifier={Scene.SavedInsights}
                        to={urls.savedInsights()}
                        sideAction={{
                            icon: <IconPlus />,
                            to: urls.insightNew(),
                            tooltip: 'New analytic',
                            identifier: Scene.Insight,
                            onClick: hideSideBarMobile,
                        }}
                    />
                    <PageButton
                        icon={<IconRecording />}
                        identifier={Scene.SessionRecordings}
                        to={urls.sessionRecordings()}
                    />

                    {featureFlags[FEATURE_FLAGS.WEB_PERFORMANCE] && (
                        <PageButton
                            icon={<IconCoffee />}
                            identifier={Scene.WebPerformance}
                            to={urls.webPerformance()}
                        />
                    )}
                    {featureFlags[FEATURE_FLAGS.FRONTEND_APPS] ? (
                        <div className="SideBar__heading">Data</div>
                    ) : (
                        <LemonDivider />
                    )}

                    <PageButton icon={<IconLive />} identifier={Scene.Events} to={urls.events()} />
                    <PageButton
                        icon={<UnverifiedEvent />}
                        identifier={Scene.DataManagement}
                        to={urls.eventDefinitions()}
                    />
                    <PageButton
                        icon={<IconPerson />}
                        identifier={Scene.Persons}
                        to={urls.persons()}
                        title={'Visitor'}
                    />
                    <PageButton icon={<IconCohort />} identifier={Scene.Cohorts} to={urls.cohorts()} />
                    {featureFlags[FEATURE_FLAGS.FRONTEND_APPS] ? (
                        <>
                            {canViewPlugins(currentOrganization) || Object.keys(frontendApps).length > 0 ? (
                                <>
                                    <div className="SideBar__heading">Apps</div>
                                    {canViewPlugins(currentOrganization) && (
                                        <PageButton
                                            title="Browse Apps"
                                            icon={<IconApps />}
                                            identifier={Scene.Plugins}
                                            to={urls.projectApps()}
                                        />
                                    )}
                                    {Object.keys(frontendApps).length > 0 && <SideBarApps />}
                                </>
                            ) : null}
                            <div className="SideBar__heading">Configuration</div>
                        </>
                    ) : (
                        <>
                            <LemonDivider />
                            {canViewPlugins(currentOrganization) && (
                                <PageButton icon={<IconApps />} identifier={Scene.Plugins} to={urls.projectApps()} />
                            )}
                        </>
                    )}
                    <PageButton
                        icon={<IconSettings />}
                        identifier={Scene.ProjectSettings}
                        to={urls.projectSettings()}
                    />
                </>

            )}
            {/* Add the LemonDivider and new PageButton */}
            <LemonDivider />
            <PageButton
                icon={<IconCrypto />}
                identifier={Scene.ComEng} // Replace with the correct identifier for your Scene
                to={urls.comEng()} // Replace with the correct URL for your Scene
                title="Community Engagement" // Replace with the desired title
            />
        </ul>
    )
}

export function SideBar({ children }: { children: React.ReactNode }): JSX.Element {
    const { isSideBarShown } = useValues(navigationLogic)
    const { hideSideBarMobile } = useActions(navigationLogic)

    return (
        <div className={clsx('SideBar', 'SideBar__layout', !isSideBarShown && 'SideBar--hidden')}>
            <div className="SideBar__slider">
                <div className="SideBar__content">
                    <Pages />
                </div>
            </div>
            <div className="SideBar__overlay" onClick={hideSideBarMobile} />
            {children}
        </div>
    )
}
