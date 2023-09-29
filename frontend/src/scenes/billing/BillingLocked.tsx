import React from 'react'
import './BillingSubscribed.scss'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useValues } from 'kea'
import { SceneExport } from 'scenes/sceneTypes'
import { billingLogic } from './billingLogic'
import { BillingSubscribedTheme } from './BillingSubscribed'
import { compactNumber } from 'lib/utils'
import { LemonButton } from '@analytickit/lemon-ui'

export const scene: SceneExport = {
    component: BillingLocked,
}

export function BillingLocked(): JSX.Element | null {
    const { billing } = useValues(billingLogic)
    return billing ? (
        <BillingSubscribedTheme>
            <div className="title">
                <CloseCircleOutlined style={{ color: 'var(--danger)' }} className="title-icon" />
                <h2 className="subtitle">Please enter a credit card</h2>
            </div>
            <p>
                You've used <strong>{compactNumber(billing.current_usage)}</strong> events this month. To continue using
                analytickit, you'll need to enter a credit card. See{' '}
                <a href="https://analytickit.com/pricing" target="_blank" rel="noopener noreferrer">
                    our website for pricing information.
                </a>
                <br />
                <br />
                You'll only be charged for events from the moment you put your credit card details in.
            </p>
            <div className="mt text-center">
                <LemonButton
                    className="cta-button"
                    type="primary"
                    size="large"
                    center={true}
                    href={billing.subscription_url}
                >
                    Continue to verify card
                </LemonButton>
            </div>
        </BillingSubscribedTheme>
    ) : null
}
