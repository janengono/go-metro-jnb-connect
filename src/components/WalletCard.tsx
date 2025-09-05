import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {TopUp} from '@/components/TopUp';
import { 
  CreditCard, 
  Plus, 
  History, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Smartphone,
  X,
  Calendar,
  Filter
} from 'lucide-react';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

interface Transaction {
  id: string;
  type: 'payment' | 'topup';
  amount: number;
  description: string;
  date: string;
  busNumber?: string;
}

export const WalletCard: React.FC = () => {
  const { user } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showLowBalanceToast, setShowLowBalanceToast] = useState(false);

  const monthlySpending = 324.80; // This could also be fetched from Firestore

  // Initialize user document with balance if it doesn't exist
  const initializeUserDocument = async () => {
    if (!user?.uid) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document with initial balance
        await setDoc(userDocRef, {
          balance: 0,
          transactions: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Check if balance field exists, if not add it
        const data = userDoc.data();
        if (data.balance === undefined) {
          await updateDoc(userDocRef, {
            balance: 0,
            transactions: data.transactions || 0,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error("Error initializing user document:", error);
    }
  };

  // Subscribe to user balance changes
  useEffect(() => {
    if (!user?.uid) return;
    
    // Initialize user document first
    initializeUserDocument();
    
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserBalance(data.balance || 0);
      }
      setBalanceLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

    useEffect(() => {
        if (userBalance <= 50 && !balanceLoading) {
          setShowLowBalanceToast(true);
        } else {
          setShowLowBalanceToast(false);
        }
      }, [userBalance, balanceLoading]);
      
      useEffect(() => {
        if (showLowBalanceToast) {
          const timer = setTimeout(() => setShowLowBalanceToast(false), 10000);
          return () => clearTimeout(timer);
        }
      }, [showLowBalanceToast]);

  // Extended transaction history with more entries
  const allTransactions: Transaction[] = [
    {
      id: '1',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-30 14:23',
      busNumber: '243'
    },
    {
      id: '2',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-30 08:15',
      busNumber: '156'
    },
    {
      id: '3',
      type: 'topup',
      amount: 100.00,
      description: 'Wallet Top-up',
      date: '2024-08-29 19:42'
    },
    {
      id: '4',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-29 17:30',
      busNumber: '089'
    },
    {
      id: '5',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-29 09:15',
      busNumber: '243'
    },
    {
      id: '6',
      type: 'topup',
      amount: 50.00,
      description: 'Wallet Top-up',
      date: '2024-08-28 20:30'
    },
    {
      id: '7',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-28 16:45',
      busNumber: '156'
    },
    {
      id: '8',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-28 07:20',
      busNumber: '089'
    },
    {
      id: '9',
      type: 'topup',
      amount: 200.00,
      description: 'Wallet Top-up',
      date: '2024-08-27 18:15'
    },
    {
      id: '10',
      type: 'payment',
      amount: -8.50,
      description: 'Bus Fare',
      date: '2024-08-27 15:30',
      busNumber: '243'
    }
  ];

  // Show only recent transactions when not in history mode
  const recentTransactions = allTransactions.slice(0, 4);
  const displayTransactions = showHistory ? allTransactions : recentTransactions;

  const quickAmounts = [50, 100, 200, 300];

  // Handle balance update callback
  const handleBalanceUpdate = (incrementAmount: number) => {
    // Don't update local state - let Firestore listener handle it
    // This prevents double updates
    setTopUpAmount(undefined);
  };

  // Handle top-up modal close
  const handleTopUpClose = () => {
    setShowTopUp(false);
    setTopUpAmount(undefined);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (balanceLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If showing full history, render the history view
  if (showHistory) {
    return (
      <div className="p-4 space-y-6">
        {/* History Header */}
        <Card className="metro-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              <h2 className="metro-subheading">Transaction History</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistory(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* History Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-primary/10 rounded-xl">
              <p className="text-lg font-bold text-foreground">{allTransactions.length}</p>
              <p className="text-xs text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-xl">
              <p className="text-lg font-bold text-foreground">
                {allTransactions.filter(t => t.type === 'topup').length}
              </p>
              <p className="text-xs text-muted-foreground">Top-ups</p>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-xl">
              <p className="text-lg font-bold text-foreground">
                {allTransactions.filter(t => t.type === 'payment').length}
              </p>
              <p className="text-xs text-muted-foreground">Payments</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        </Card>

        {/* All Transactions */}
        <Card className="metro-card">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allTransactions.map((transaction, index) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-xl metro-fade-in hover:bg-muted/30 transition-colors"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'payment' 
                      ? 'bg-red-500/10' 
                      : 'bg-green-500/10'
                  }`}>
                    {transaction.type === 'payment' ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    {transaction.busNumber && (
                      <p className="text-sm text-muted-foreground">Bus {transaction.busNumber}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'payment' 
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Default wallet view
  return (
    <div className="p-4 space-y-6">
      {/* Low Balance Toast */}
        {showLowBalanceToast && (
          <div className="fixed top-4 right-4 z-50 bg-white  px-6 py-3 square shadow-lg">
            <span className="text-red-600 ">
              ⚠️ Your balance : R{userBalance.toFixed(2)} is low!
            </span>
            
          </div>
        )}
      {/* Balance Card */}
      <Card className="metro-card metro-gradient-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="metro-caption text-muted-foreground/80">Current Balance</p>
            <p className="text-4xl font-bold text-foreground">R {userBalance.toFixed(2)}</p>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-2xl">
            <CreditCard className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="metro-button-primary flex-1"
            onClick={() => setShowTopUp(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Top Up
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setShowHistory(true)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </Card>

      {/* Top-Up Modal */}
      {showTopUp && (
        <Card className="metro-card border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="metro-subheading">Top Up Wallet</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleTopUpClose}
            >
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Balance: R{userBalance.toFixed(2)}
              </label>
              <label className="block text-sm font-medium text-foreground mb-2">
                Please enter a minimum of R50
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={topUpAmount || ""}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="text-lg"
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Quick Amounts</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setTopUpAmount(amount)}
                    className="text-sm"
                  >
                    R{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Google Pay button container */}
            <div className="flex justify-center mt-4">
              {topUpAmount && topUpAmount >= 50 ? (
                <TopUp 
                  topUpAmount={topUpAmount}
                  onClose={handleTopUpClose}
                  onBalanceUpdate={handleBalanceUpdate}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter R50 or more to enable Google Pay
                </p>
              )}
            </div>

            {topUpAmount && topUpAmount >= 50 && (
              <div className="text-center pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  New balance will be: R{(userBalance + topUpAmount).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Monthly Overview */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="metro-subheading">This Month</h2>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-foreground">R {monthlySpending.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-xl">
            <p className="text-2xl font-bold text-foreground">38</p>
            <p className="text-sm text-muted-foreground">Trips Taken</p>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="metro-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="metro-subheading">Recent Transactions</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => setShowHistory(true)}
          >
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {displayTransactions.map((transaction, index) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-xl metro-fade-in hover:bg-muted/30 transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setShowHistory(true)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'payment' 
                    ? 'bg-red-500/10' 
                    : 'bg-green-500/10'
                }`}>
                  {transaction.type === 'payment' ? (
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  {transaction.busNumber && (
                    <p className="text-sm text-muted-foreground">Bus {transaction.busNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'payment' 
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Features */}
      <Card className="metro-card">
        <h3 className="metro-subheading mb-4">Security & Features</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Secure Digital Wallet</p>
              <p className="text-sm text-muted-foreground">No physical cards needed</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
            <Smartphone className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-medium text-foreground">Contactless Payments</p>
              <p className="text-sm text-muted-foreground">Tap to pay with your phone</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
