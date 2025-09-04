// googlePay.ts
// googlePay.ts
//declare const google: any;

export const getGooglePaymentsClient = () => {
  return new google.payments.api.PaymentsClient({ environment: "TEST" });
};

