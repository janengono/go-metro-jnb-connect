import React, { useEffect } from "react";
import { getGooglePaymentsClient } from "@/lib/googlePay";
import { createPaymentDataRequest } from "@/lib/googlePayConfig";
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

type TopUpProps = {
  topUpAmount: number;
  onClose: () => void;
  onBalanceUpdate?: (newBalance: number) => void; // Callback to update parent component
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
      
      // Update user balance in Firestore
      if (user?.uid) {
        await updateUserBalance(user.uid, topUpAmount);
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

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      // Update the user's balance in Firestore
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        balance: increment(amount),
        lastTopUp: new Date(),
        // You might also want to add a transaction history
        transactions: increment(1)
      });
      
      // If you have a callback to update the parent component's state
      if (onBalanceUpdate) {
        // You'd need to fetch the new balance or calculate it
        // For now, we'll assume you pass the new balance back
        onBalanceUpdate(amount); // This would be the increment amount
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  return <div id="container"></div>;
};