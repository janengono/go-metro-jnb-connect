import React, { useEffect } from "react";
import { getGooglePaymentsClient } from "@/lib/googlePay";
import { createPaymentDataRequest } from "@/lib/googlePayConfig";
import { useToast } from '@/hooks/use-toast';

type TopUpProps = {
  topUpAmount: number;
  onClose: () => void;
};

export const TopUp: React.FC<TopUpProps> = ({ topUpAmount, onClose }) => {
  const { toast } = useToast();
  useEffect(() => {
    if (!topUpAmount || topUpAmount < 50) return;

    const client = getGooglePaymentsClient();
    const paymentDataRequest = createPaymentDataRequest(topUpAmount);

    client.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [paymentDataRequest.allowedPaymentMethods[0] as any],
    })
    .then((response) => {
      if (response.result) {
        const container = document.getElementById("container");
        container!.innerHTML = "";
        const button = client.createButton({ onClick: onGooglePayButtonClicked });
        container!.appendChild(button);
      }
    });
  }, [topUpAmount]);

  const onGooglePayButtonClicked = async () => {
    const client = getGooglePaymentsClient();
    try {
      const paymentData = await client.loadPaymentData(
        createPaymentDataRequest(topUpAmount) as any
      );
      toast({
          title: "Top Up successful!",
          description: `Succesfully loaded, R${topUpAmount} `,
        });

      // ✅ now onClose is defined
      onClose();
    } catch (err) {
      console.error("Google Pay error:", err);
    }
  };

  return <div id="container"></div>;
};
