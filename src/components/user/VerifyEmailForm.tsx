// src/components/user/VerifyEmailForm.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { verifyEmailCodeAction } from '@/app/actions/wallet/verifyEmailCodeAction';

interface VerifyEmailFormProps {
  requestId: string;
  email: string;
}

export function VerifyEmailForm({ requestId, email }: VerifyEmailFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('verificationCode', verificationCode);
      formData.append('requestId', requestId);
      formData.append('email', email);

      const result = await verifyEmailCodeAction(formData);

      if (result.success) {
        toast.success('Email verified successfully!');
        // Handle successful verification (e.g., redirect or update UI)
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="verification-code">Verification Code</Label>
        <Input
          id="verification-code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter verification code"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying...' : 'Verify Code'}
      </Button>
    </form>
  );
}
