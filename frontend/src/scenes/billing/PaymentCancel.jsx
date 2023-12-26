import React from 'react';
import { useActions } from 'kea';
import paymentCancelLogic from './paymentCancelLogic'; // Path to your logic file

const PaymentCancel = () => {
  const { replace } = useActions(paymentCancelLogic);

  const goBack = () => {
    replace('/'); // Replace with the path you want to navigate to
  };

  return (
    <div>
      <h1>Payment Cancelled</h1>
      <p>You have cancelled the payment process.</p>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
};

export default PaymentCancel;
