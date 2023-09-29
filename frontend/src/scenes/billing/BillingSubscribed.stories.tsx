import { Meta } from '@storybook/react'
import { BillingSubscribed } from './BillingSubscribed'
import { BillingLocked } from './BillingLocked' // Ensure this import is correct
import React, { useEffect } from 'react'
import { mswDecorator } from '~/mocks/browser'
import preflightJson from '~/mocks/fixtures/_preflight.json'
import { router } from 'kea-router'
import { urls } from 'scenes/urls'

export default {
    title: 'Scenes-Other/Billing',
    parameters: { layout: 'fullscreen', options: { showPanel: false }, viewMode: 'story' },
    decorators: [
        mswDecorator({
            get: {
                '/_preflight': {
                    ...preflightJson,
                    cloud: true,
                    realm: 'cloud',
                },
                // You might want to add mock endpoints for the billing API calls if they are made during the component's lifecycle
            },
        }),
    ],
} as Meta

export const Subscribed = (): JSX.Element => {
    useEffect(() => {
        router.actions.push(urls.billingSubscribed(), { s: 'success' })
    })
    return <BillingSubscribed />
}

export const _BillingLocked = (): JSX.Element => {
    // Renamed to avoid name conflict
    return <BillingLocked />
}
