import { kea } from 'kea'
import type { toolbarLogicType } from './toolbarLogicType'
import { ToolbarProps } from '~/types'
import { clearSessionToolbarToken } from '~/toolbar/utils'
import { analytickit } from '~/toolbar/analytickit'
import { actionsTabLogic } from '~/toolbar/actions/actionsTabLogic'
import { toolbarButtonLogic } from '~/toolbar/button/toolbarButtonLogic'
import type { AnalyticKit } from 'analytickit-js'

export const toolbarLogic = kea<toolbarLogicType>({
    path: ['toolbar', 'toolbarLogic'],
    props: {

    } as ToolbarProps,

    actions: () => ({
        authenticate: true,
        logout: true,
        tokenExpired: true,
        processUserIntent: true,
        clearUserIntent: true,
        showButton: true,
        hideButton: true,
    }),

    reducers: ({ props }) => ({
        rawApiURL: [props.apiURL as string],
        rawJsURL: [(props.jsURL || props.apiURL) as string],
        temporaryToken: [props.temporaryToken || null, { logout: () => null, tokenExpired: () => null }],
        actionId: [props.actionId || null, { logout: () => null, clearUserIntent: () => null }],
        userIntent: [props.userIntent || null, { logout: () => null, clearUserIntent: () => null }],
        buttonVisible: [true, { showButton: () => true, hideButton: () => false, logout: () => false }],
        dataAttributes: [(props.dataAttributes || []) as string[]],
        analytickit: [(props.analytickit ?? null) as AnalyticKit | null],
    }),

    selectors: ({ selectors }) => ({
        apiURL: [
            () => [selectors.rawApiURL],
            (apiURL) => `${apiURL.endsWith('/') ? apiURL.replace(/\/+$/, '') : apiURL}`,
        ],
        jsURL: [() => [selectors.rawJsURL], (jsURL) => `${jsURL.endsWith('/') ? jsURL.replace(/\/+$/, '') : jsURL}`],
        isAuthenticated: [() => [selectors.temporaryToken], (temporaryToken) => !!temporaryToken],
    }),

    listeners: ({ values, props }) => ({
        authenticate: () => {
            analytickit.capture('toolbar authenticate', { is_authenticated: values.isAuthenticated })
            const encodedUrl = encodeURIComponent(window.location.href)
            window.location.href = `${values.apiURL}/authorize_and_redirect/?redirect=${encodedUrl}`
            clearSessionToolbarToken()
        },
        logout: () => {
            analytickit.capture('toolbar logout')
            clearSessionToolbarToken()
        },
        tokenExpired: () => {
            analytickit.capture('toolbar token expired')
            console.log('analytickit Toolbar API token expired. Clearing session.')
            clearSessionToolbarToken()
        },
        processUserIntent: async () => {
            if (props.userIntent === 'add-action' || props.userIntent === 'edit-action') {
                actionsTabLogic.actions.showButtonActions()
                toolbarButtonLogic.actions.showActionsInfo()
                // the right view will next be opened in `actionsTabLogic` on `getActionsSuccess`
            }
        },
    }),

    events: ({ props, actions, values }) => ({
        afterMount() {
            if (props.instrument) {
                const distinctId = props.distinctId
                if (distinctId) {
                    analytickit.identify(distinctId, props.userEmail ? { email: props.userEmail } : {})
                }
                analytickit.optIn()
            }
            if (props.userIntent) {
                actions.processUserIntent()
            }
            analytickit.capture('toolbar loaded', { is_authenticated: values.isAuthenticated })
        },
    }),
})
