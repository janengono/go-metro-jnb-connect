// googlePayConfig.ts
//declare const google: any;

export const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

export const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
export const allowedCardNetworks = ["VISA", "MASTERCARD"];

export const baseCardPaymentMethod: any = {
  type: "CARD",
  parameters: {
    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    allowedCardNetworks: ["VISA", "MASTERCARD"],
  },
  tokenizationSpecification: {
    type: "PAYMENT_GATEWAY",
    parameters: {
      gateway: "example", // MUST be "example" for sandbox
      gatewayMerchantId: "exampleGatewayMerchantId",
    },
  },

};

export const createPaymentDataRequest = (amount: number): any => {
  return {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [baseCardPaymentMethod],
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPrice: amount.toFixed(2), // MUST be string
      currencyCode: "ZAR",
      countryCode: "ZA",
    },
    merchantInfo: {
      merchantName: "GoMetro (Hackathon Demo)",
      merchantId: "12345678901234567890", // sandbox ID
    },
  };
};

