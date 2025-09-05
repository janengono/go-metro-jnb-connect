import React, { useEffect } from "react";
import { getGooglePaymentsClient } from "@/lib/googlePay";
import { createPaymentDataRequest } from "@/lib/googlePayConfig";
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, increment, collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

type TopUpProps = {
  topUpAmount: number;
  onClose: () => void;
  onBalanceUpdate?: (newBalance: number) => void;
};

export const TopUp: React.FC<TopUpProps> = ({ topUpAmount, onClose, onBalanceUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();

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
     
      // Update user balance and create transaction record
      if (user?.uid) {
        await updateUserBalanceAndCreateTransaction(user.uid, topUpAmount);
      }
     
      toast({
        title: "Top Up successful!",
        description: `Successfully added R${topUpAmount} to your wallet`,
      });
     
      onClose();
    } catch (err) {
      console.error("Google Pay error:", err);
      toast({
        title: "Top Up failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateUserBalanceAndCreateTransaction = async (userId: string, amount: number) => {
    try {
      // Update the user's balance in Firestore
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        balance: increment(amount),
        lastTopUp: new Date(),
        transactions: increment(1)
      });

      // Create a transaction record
      await addDoc(collection(db, "transactions"), {
        userId: userId,
        type: 'topup',
        amount: amount,
        description: 'Wallet Top-up',
        date: new Date(),
        status: 'completed',
        paymentMethod: 'google_pay'
      });
     
      if (onBalanceUpdate) {
        onBalanceUpdate(amount);
      }
    } catch (error) {
      console.error("Error updating balance and creating transaction:", error);
      throw error;
    }
  };

  return <div id="container"></div>;
};