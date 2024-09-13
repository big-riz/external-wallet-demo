// src/components/user/VerifyEmail.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { VerifyEmailForm } from '@/components/user/VerifyEmailForm';
import { requestEmailCodeAction } from '@/app/actions/requestEmailCodeAction';

export function VerifyEmail() {
  const [showForm, setShowForm] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerifyEmail = () => {
    startTransition(async () => {
      try {
        const result = await requestEmailCodeAction();
        if (result && result.requestId) {
          setRequestId(result.requestId);
          setShowForm(true);
          toast.success('Verification code sent to your email');
        } else {
          toast.error('Failed to request email verification');
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
          <p>You don't have a wallet yet.</p>
          <Button onClick={handleVerifyEmail} disabled={isPending}>
            {isPending ? 'Sending Verification Code...' : 'Verify Email'}
          </Button>
        </div>
      ) : (
        <VerifyEmailForm requestId={requestId as string} /> // Render the form component
      )}
    </>
  );
}
