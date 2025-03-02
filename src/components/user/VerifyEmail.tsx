'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { VerifyEmailForm } from '@/components/user/VerifyEmailForm';
import { requestEmailCodeAction } from '@/app/actions/wallet/requestEmailCodeAction';

interface VerifyEmailProps {
  email: string;
}

export function VerifyEmail({ email }: VerifyEmailProps) {
  const [showForm, setShowForm] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerifyEmail = () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestEmailCodeAction(email);
        if (result.success && result.requestId) {
          setRequestId(result.requestId);
          setShowForm(true);
          toast.success('Verification code sent to your email');
        } else {
          toast.error(result.error || 'Failed to request email verification');
        }
      } catch (error) {
        console.error('Error requesting email code:', error);
        toast.error('Failed to request email verification');
      }
    });
  };

  return (
    <>
      {!showForm ? (
        <div className="mt-4">
          <p>You dont have a wallet yet.</p>
          <Button onClick={handleVerifyEmail} disabled={isPending}>
            {isPending ? 'Sending Verification Code...' : 'Verify Email'}
          </Button>
        </div>
      ) : (
        <VerifyEmailForm requestId={requestId as string} email={email} />
      )}
    </>
  );
}
