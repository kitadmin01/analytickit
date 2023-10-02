import { Button, Card, Col, Row, Skeleton} from 'antd';
import { useValues } from 'kea';
import { billingLogic } from './billingLogic';
import defaultImg from 'public/plan-default.svg';
import { Spinner } from 'lib/components/Spinner/Spinner';
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import api from 'lib/api';

type PlanType = {
    key: string;
    name: string;
    price_string: string;
    url: string;
    image_url: string;
};

interface PlanProps {
    plan: PlanType;
    onSubscribe: (plan: PlanType) => void;
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
    );
}

export function BillingEnrollment(): JSX.Element | null {
    const [availablePlans, setAvailablePlans] = useState<PlanType[]>([]);
    const { plansLoading, billingSubscriptionLoading } = useValues(billingLogic);

    /**const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

    const showPaymentModal = (plan: PlanType):void => {
        setSelectedPlan(plan);
        setIsModalVisible(true);
    };

    const handleConfirmPayment = ():void => {
        if (selectedPlan) {
            handleBillingSubscribe(selectedPlan);
        }
        setIsModalVisible(false);
    };

    const handleCancelPayment = ():void => {
        setIsModalVisible(false);
    };*/

    useEffect(() => {
        fetch('/api/plans/')
            .then(response => response.json())
            .then(data => setAvailablePlans(data));
    }, []);

    const STRIPE_PUBLIC_KEY = "pk_test_51MCCGYFtMel7myQSEOfWiBOkj5xiGIBFWurBvRQuk9NmMCl6KyidtoGLobYwWd84ADPNwUBS71VS1GVC7vm9P9Jx00QxCLxtJ4";
    const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

    const handleBillingSubscribe = (plan: PlanType):void => {
        (async () => {
            try {
                const response = await api.create('api/checkout/', { plan });
                
                if (response.error) {
                    console.error(response.error);
                    // Display the error to the user using a modal, toast, or any other UI component
                    return;
                }
    
                const sessionId = response.id;
                const stripe = await stripePromise;
                if (!stripe) {
                    console.error("Stripe failed to initialize.");
                    return;
                }
                const result = await stripe.redirectToCheckout({ sessionId });
    
                if (result.error) {
                    console.error(result.error.message);
                }
            } catch (error) {
                console.error("Error starting the checkout process:", error);
            }
        })();
    };
    
    

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
                    {availablePlans.map((plan) => (
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
