import { useValues, useActions } from 'kea'
import { dashboardsLogic } from './dashboardsModel'
import { LemonInput } from 'lemon-ui'

export function Dashboards(): JSX.Element {
    const { loading, sortedWeb2Dashboards, sortedWeb3Dashboards } = useValues(dashboardsLogic)
    const { loadDashboards } = useActions(dashboardsLogic)
    const { searchTerm, setSearchTerm } = useValues(dashboardsLogic)

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h2>Web2 Dashboards</h2>
            <div>
                {sortedWeb2Dashboards.map((dashboard) => (
                    <div key={dashboard.id}>
                        <h3>{dashboard.name}</h3>
                        <p>{dashboard.description}</p>
                    </div>
                ))}
            </div>

            <h2>Web3 Dashboards</h2>
            <div>
                {sortedWeb3Dashboards.map((dashboard) => (
                    <div key={dashboard.id}>
                        <h3>{dashboard.name}</h3>
                        <p>{dashboard.description}</p>
                    </div>
                ))}
            </div>

            <LemonInput value={searchTerm || ''} onChange={setSearchTerm} placeholder="Search dashboards..." />
        </div>
    )
}
