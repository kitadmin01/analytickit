import * as React from 'react'
import '~/styles'
import './storybook.scss'
import { worker } from '~/mocks/browser'
import { loadanalytickitJS } from '~/loadanalytickitJS'
import { KeaStory } from './kea-story'
import { getStorybookAppContext } from 'storybook/app-context'
import { useAvailableFeatures } from '~/mocks/features'

const setupMsw = () => {
    // Make sure the msw worker is started
    worker.start()
    ;(window as any).__mockServiceWorker = worker
    ;(window as any).analytickit_APP_CONTEXT = getStorybookAppContext()
}
setupMsw()

const setupanalytickitJs = () => {
    // Make sure we don't hit production analytickit. We want to control requests to,
    // e.g. `/decide/` for feature flags
    window.JS_analytickit_HOST = window.location.origin

    // We don't be doing any authn so we can just use a fake key
    window.JS_analytickit_API_KEY = 'dummy-key'

    loadanalytickitJS()
}

setupanalytickitJs()

// Setup storybook global parameters. See https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*', disabled: true },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    options: {
        // automatically show code panel
        showPanel: false,
        storySort: {
            method: 'alphabetical',
            order: [
                'Lemon UI',
                ['Overview', 'Utilities', 'Icons'],
                'Components',
                'Forms',
                ['Field'],
                'Filters',
                'Layout',
            ],
            includeName: true,
        },
    },
    viewMode: 'docs',
    // auto-expand code blocks in docs
    docs: {
        source: { state: 'closed' },
    },
}

// Setup storybook global decorators. See https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators
export const decorators = [
    // Make sure the msw service worker is started, and reset the handlers to
    // defaults.
    (Story: any) => {
        // Reset enabled enterprise features. Overwrite this line within your stories.
        useAvailableFeatures([])
        return (
            <KeaStory>
                <Story />
            </KeaStory>
        )
    },
]
