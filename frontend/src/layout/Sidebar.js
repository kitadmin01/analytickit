import './Sidebar.scss'

import React, { useState } from 'react'
import { router } from 'kea-router'
import { InviteTeam } from 'lib/components/InviteTeam'
import { Menu, Layout, Modal } from 'antd'
import {
    UserOutlined,
    ForkOutlined,
    FunnelPlotOutlined,
    SettingOutlined,
    RiseOutlined,
    PlusOutlined,
    SyncOutlined,
    AimOutlined,
    UsergroupAddOutlined,
    ContainerOutlined,
    LineChartOutlined,
    FundOutlined,
} from '@ant-design/icons'
import { useActions, useValues } from 'kea'
import { Link } from 'lib/components/Link'
import { sceneLogic } from 'scenes/sceneLogic'
import { dashboardsModel } from '~/models/dashboardsModel'
import whiteLogo from './_assets/white-logo.svg'
import { triggerResizeAfterADelay } from 'lib/utils'

const itemStyle = { display: 'flex', alignItems: 'center' }

function Logo() {
    return (
        <div
            className="row logo-row d-flex align-items-center justify-content-center"
            style={{ margin: 16, height: 42 }}
        >
            <img className="logo posthog-logo" src={whiteLogo} style={{ maxHeight: '100%' }} />
            <div className="posthog-title">PostHog</div>
        </div>
    )
}

// to show the right page in the sidebar
const sceneOverride = {
    action: 'actions',
    funnel: 'funnels',
    editFunnel: 'funnels',
    person: 'people',
    dashboard: 'dashboards',
}

// to show the open submenu
const submenuOverride = {
    actions: 'events',
    liveActions: 'events',
    cohorts: 'people',
}

export default function Sidebar(props) {
    const [inviteModalOpen, setInviteModalOpen] = useState(false)

    const { scene, loadingScene } = useValues(sceneLogic)
    const { location } = useValues(router)
    const { push } = useActions(router)
    const { dashboards, pinnedDashboards } = useValues(dashboardsModel)

    let activeScene = sceneOverride[loadingScene || scene] || loadingScene || scene
    const openSubmenu = submenuOverride[activeScene] || activeScene

    if (activeScene === 'dashboards') {
        const dashboardId = parseInt(location.pathname.split('/dashboard/')[1])
        const dashboard = dashboardId && dashboards.find(d => d.id === dashboardId)
        if (dashboard && dashboard.pinned) {
            activeScene = `dashboard-${dashboardId}`
        }
    }

    return (
        <Layout.Sider breakpoint="lg" collapsedWidth="0" className="bg-dark" onCollapse={triggerResizeAfterADelay}>
            <Menu
                className="h-100 bg-dark"
                theme="dark"
                selectedKeys={[activeScene]}
                openKeys={[openSubmenu]}
                mode="inline"
            >
                <Logo />

                {pinnedDashboards.map(dashboard => (
                    <Menu.Item key={`dashboard-${dashboard.id}`} style={itemStyle}>
                        <LineChartOutlined />
                        <span className="sidebar-label">{dashboard.name}</span>
                        <Link to={`/dashboard/${dashboard.id}`} />
                    </Menu.Item>
                ))}
                {pinnedDashboards.length > 0 ? <Menu.Divider /> : null}

                <Menu.Item key="trends" style={itemStyle}>
                    <RiseOutlined />
                    <span className="sidebar-label">{'Trends'}</span>
                    <Link to={'/trends'} />
                </Menu.Item>

                <Menu.Item key="dashboards" style={itemStyle} data-attr="menu-item-dashboards">
                    <FundOutlined />
                    <span className="sidebar-label">Dashboards</span>
                    <Link to="/dashboard" />
                </Menu.Item>

                <Menu.SubMenu
                    key="events"
                    title={
                        <span style={itemStyle}>
                            <ContainerOutlined />
                            <span className="sidebar-label">{'Events'}</span>
                        </span>
                    }
                    onTitleClick={() => (location.pathname !== '/events' ? push('/events') : null)}
                >
                    <Menu.Item key="events" style={itemStyle}>
                        <ContainerOutlined />
                        <span className="sidebar-label">{'All Events'}</span>
                        <Link to={'/events'} />
                    </Menu.Item>
                    <Menu.Item key="actions" style={itemStyle}>
                        <AimOutlined />
                        <span className="sidebar-label">{'Actions'}</span>
                        <Link to={'/actions'} />
                    </Menu.Item>
                    <Menu.Item key="liveActions" style={itemStyle}>
                        <SyncOutlined />
                        <span className="sidebar-label">{'Live Actions'}</span>
                        <Link to={'/actions/live'} />
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu
                    key="people"
                    title={
                        <span style={itemStyle}>
                            <UserOutlined />
                            <span className="sidebar-label">{'People'}</span>
                        </span>
                    }
                    onTitleClick={() => (location.pathname !== '/people' ? push('/people') : null)}
                >
                    <Menu.Item key="people" style={itemStyle}>
                        <UserOutlined />
                        <span className="sidebar-label">{'All Users'}</span>
                        <Link to={'/people'} />
                    </Menu.Item>
                    <Menu.Item key="cohorts" style={itemStyle}>
                        <UsergroupAddOutlined />
                        <span className="sidebar-label">{'Cohorts'}</span>
                        <Link to={'/people/cohorts'} />
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.Item key="funnels" style={itemStyle}>
                    <FunnelPlotOutlined />
                    <span className="sidebar-label">{'Funnels'}</span>
                    <Link to={'/funnel'} />
                </Menu.Item>
                <Menu.Item key="paths" style={itemStyle}>
                    <ForkOutlined />
                    <span className="sidebar-label">{'Paths'}</span>
                    <Link to={'/paths'} />
                </Menu.Item>
                <Menu.Item key="setup" style={itemStyle}>
                    <SettingOutlined />
                    <span className="sidebar-label">{'Setup'}</span>
                    <Link to={'/setup'} />
                </Menu.Item>
                <Menu.Item key="invite" style={itemStyle} onClick={() => setInviteModalOpen(true)}>
                    <PlusOutlined />
                    <span className="sidebar-label">{'Invite your team'}</span>
                </Menu.Item>
            </Menu>

            <Modal visible={inviteModalOpen} footer={null} onCancel={() => setInviteModalOpen(false)}>
                <InviteTeam user={props.user} />
            </Modal>
        </Layout.Sider>
    )
}
