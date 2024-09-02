import { actions, connect, kea, listeners, path, reducers } from 'kea'
import type { newDashboardLogicType } from './newDashboardLogicType'
import { DashboardRestrictionLevel } from 'lib/constants'
import { DashboardType } from '~/types'
import api from 'lib/api'
import { teamLogic } from 'scenes/teamLogic'
import { router } from 'kea-router'
import { urls } from 'scenes/urls'
import { dashboardsModel } from '~/models/dashboardsModel'
import { forms } from 'kea-forms'

export interface NewDashboardForm {
    name: string
    description: string // Fixed this to be of type `string` instead of a default empty string
    show: boolean
    useTemplate: string
    restrictionLevel: DashboardRestrictionLevel
    crypto: boolean // This field determines if the dashboard is a Web3 (crypto) dashboard
}

const defaultFormValues: NewDashboardForm = {
    name: '',
    description: '', 
    show: false,
    useTemplate: '',
    restrictionLevel: DashboardRestrictionLevel.EveryoneInProjectCanEdit,
    crypto: false,
}

export const newDashboardLogic = kea<newDashboardLogicType>([
    path(['scenes', 'dashboard', 'newDashboardLogic']),
    connect(dashboardsModel),
    actions({
        showNewDashboardModal: true,
        hideNewDashboardModal: true,
        addDashboard: (form: Partial<NewDashboardForm>) => ({ form }),
        createAndGoToDashboard: true,
    }),
    reducers({
        newDashboardModalVisible: [
            false,
            {
                showNewDashboardModal: () => true,
                hideNewDashboardModal: () => false,
            },
        ],
    }),
    forms(({ actions }) => ({
        newDashboard: {
            defaults: defaultFormValues,
            errors: ({ name, restrictionLevel }) => ({
                name: !name ? 'Please give your dashboard a name.' : null,
                restrictionLevel: !restrictionLevel ? 'Restriction level needs to be specified.' : null,
            }),
            submit: async ({ name, description, useTemplate, restrictionLevel, show, crypto }, breakpoint) => {
                let result: DashboardType
                const teamId = teamLogic.values.currentTeamId  // Get the current team ID

                if (crypto) {
                    // Handle Web3 (crypto) dashboard creation
                    result = await api.create(`api/web3-dashboard/`, {
                        name,
                        description,
                        use_template: useTemplate,
                        restriction_level: restrictionLevel,
                        team_id: teamId, 
                    })
                } else {
                    // Handle Web2 dashboard creation
                    result = await api.create(`api/projects/${teamId}/dashboards/`, {
                        name,
                        description,
                        use_template: useTemplate,
                        restriction_level: restrictionLevel,
                    } as Partial<DashboardType>)
                }

                actions.hideNewDashboardModal()
                actions.resetNewDashboard()
                dashboardsModel.actions.addDashboardSuccess(result) // Update the dashboards model with the new dashboard

                if (show) {
                    breakpoint()
                    router.actions.push(urls.dashboard(result.id)) // Navigate to the newly created dashboard
                }
            },
        },
    })),
    listeners(({ actions }) => ({
        addDashboard: ({ form }) => {
            actions.resetNewDashboard() // Reset the form values before showing the modal
            actions.setNewDashboardValues({ ...defaultFormValues, ...form }) // Set the values from the form
            actions.submitNewDashboard() // Submit the form to create the dashboard
        },
        showNewDashboardModal: () => {
            actions.resetNewDashboard() // Reset the form values when showing the modal
        },
        createAndGoToDashboard: () => {
            actions.setNewDashboardValue('show', true) // Ensure the dashboard is shown after creation
            actions.submitNewDashboard() // Submit the form to create the dashboard and then navigate to it
        },
    })),
])
