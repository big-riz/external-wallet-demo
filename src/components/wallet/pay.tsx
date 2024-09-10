import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SendPaymentProps {
  refreshUser: () => Promise<void>;
}

export function SendPayment({ refreshUser }: SendPaymentProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setIsLoading(true);
    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber)) {
        throw new Error('Invalid amount');
      }

      const response = await apiService.makePayment(token, destination, amountNumber);
      if (response.data) {
        toast.success('Payment sent successfully!');
        setDestination('');
        setAmount('');
        await refreshUser(); // Refresh user data after successful payment
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Recipient Destination (WalletId, Paymail)</Label>
            <Input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter recipient's wallet ID or paymail"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Pay'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}