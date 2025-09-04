import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'payment' | 'topup';
  amount: number;
  description: string;
  date: string;
  busNumber?: string;
}

export const WalletCard: React.FC = () => {
  
  const [showTopUp, setShowTopUp] = useState(false);
   const [topUpAmount, setTopUpAmount] = useState<number>();

  const currentBalance = 87.50;
  const monthlySpending = 324.80;

  const recentTransactions: Transaction[] = [
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
    }
  ];

  const quickAmounts = [ 50, 100, 200, 300];

  const handleTopUp = (amount: number) => {
    // Handle top-up logic
    console.log(`Topping up R${amount}`);
    setShowTopUp(false);
    
  };

  return (
    <div className="p-4 space-y-6">
      {/* Balance Card */}
      <Card className="metro-card metro-gradient-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="metro-caption text-muted-foreground/80">Current Balance</p>
            <p className="text-4xl font-bold text-foreground">R {currentBalance.toFixed(2)}</p>
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
          
          <Button variant="outline" className="flex-1">
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
                  onClick={() => setShowTopUp(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Please enter a minimum of R50
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={topUpAmount}
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
                  {topUpAmount >= 50 ? (
                    <TopUp topUpAmount={topUpAmount} 
                     onClose={() => setShowTopUp(false)} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter R50 or more to enable Google Pay
                    </p>
                  )}
                </div>
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
        <h2 className="metro-subheading mb-4">Recent Transactions</h2>
        
        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-xl metro-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'payment' 
                    ? 'bg-alert/10' 
                    : 'bg-primary/10'
                }`}>
                  {transaction.type === 'payment' ? (
                    <ArrowUpRight className="w-4 h-4 text-alert" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  {transaction.busNumber && (
                    <p className="text-sm text-muted-foreground">Bus {transaction.busNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'payment' 
                    ? 'text-alert' 
                    : 'text-primary'
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