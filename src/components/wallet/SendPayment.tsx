'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRightIcon, WalletIcon } from 'lucide-react';
import { makePayment } from '@/app/actions/makePayment';
import { useWallet } from '@/app/context/WalletContext';

export function SendPayment() {
  const router = useRouter();
  const { refreshBalances } = useWallet();
  const [isPending, startTransition] = useTransition();

  const handlePayment = async (formData: FormData) => {
    try {
      const res = await makePayment(formData);
      if(res.error) {
        toast.error(res.error || 'Failed to process payment');
      } else {
        toast.success('Payment sent successfully!');
        refreshBalances();
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      toast.error('Failed to process payment');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Send Payment</CardTitle>
      </CardHeader>
      <form action={handlePayment}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Recipient</Label>
              <div className="relative">
                <WalletIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="destination"
                  name="destination"
                  type="text"
                  placeholder="Enter recipient's wallet ID or paymail"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  $
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Processing...' : 'Send Payment'}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
