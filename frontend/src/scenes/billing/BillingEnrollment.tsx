import { Button, Card, Col, Row, Skeleton } from 'antd'
import { useActions, useValues } from 'kea'
import { billingLogic } from './billingLogic'
import defaultImg from 'public/plan-default.svg'
import { Spinner } from 'lib/components/Spinner/Spinner'
import React from 'react'

interface PlanProps {
    plan: {
        key: string
        name: string
        price_string: string
        image_url?: string
    }
    onSubscribe: (plan: { key: string }) => void
}

function Plan({ plan, onSubscribe }: PlanProps): JSX.Element {
    return (
        <Card>
            <div className="cursor-pointer" onClick={() => onSubscribe(plan)}>
                <img src={plan.image_url || defaultImg} alt="" height={100} width={100} />
                <h3 style={{ fontSize: 22 }}>{plan.name}</h3>
                <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: 16 }}>{plan.price_string}</div>
            </div>
            <div>
                <Button
                    data-attr="btn-subscribe-now"
                    data-plan={plan.key}
                    type="primary"
                    onClick={() => onSubscribe(plan)}
                >
                    Subscribe now
                </Button>
            </div>
        </Card>
    )
}

export function BillingEnrollment(): JSX.Element | null {
    const { plans, plansLoading, billingSubscriptionLoading } = useValues(billingLogic)
    const { subscribe } = useActions(billingLogic)

    const handleBillingSubscribe = (plan: { key: string }): void => {
        subscribe(plan.key)
    }

    if (!plans.length && !plansLoading) {
        // If there are no plans to which enrollment is available, no point in showing the component
        return null
    }

    return (
        <>
            <div className="space-top" />
            {plansLoading ? (
                <Card>
                    <Skeleton active />
                </Card>
            ) : (
                <Card title="Billing Plan Enrollment">
                    <Row gutter={16} className="space-top" style={{ display: 'flex', justifyContent: 'center' }}>
                        {plans.map((plan) => (
                            <Col sm={8} key={plan.key} className="text-center">
                                {billingSubscriptionLoading ? (
                                    <Spinner />
                                ) : (
                                    <Plan plan={plan} onSubscribe={handleBillingSubscribe} />
                                )}
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}
        </>
    )
}
