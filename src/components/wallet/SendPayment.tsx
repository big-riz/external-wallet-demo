'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { makePayment } from '@/app/actions/makePayment';

export function SendPayment() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePayment = async (formData: FormData) => {
    try {
      await makePayment(formData);
      toast.success('Payment sent successfully!');
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Failed to process payment');
    }
  };

  return (
    <form action={handlePayment} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">
          Recipient Destination (WalletId, Paymail)
        </Label>
        <Input
          id="destination"
          name="destination"
          type="text"
          placeholder="Enter recipient's wallet ID or paymail"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          placeholder="Enter amount in USD"
          step="0.001"
          min="0.001"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Processing...' : 'Pay'}
      </Button>
    </form>
  );
}
