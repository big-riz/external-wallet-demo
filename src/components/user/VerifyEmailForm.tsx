// src/components/user/VerifyEmailForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import { Check, X } from 'lucide-react';
import { checkAliasAvailabilityAction } from '@/app/actions/checkAliasAvailabilityAction';
import { createWalletAction } from '@/app/actions/createWalletAction';
import { useWallet } from '@/app/context/WalletContext';

interface VerifyEmailFormProps {
  requestId: string;
}

export function VerifyEmailForm({ requestId }: VerifyEmailFormProps) {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [alias, setAlias] = useState('');
  const [isAliasAvailable, setIsAliasAvailable] = useState<boolean | null>(null);
  const [isCheckingAlias, setIsCheckingAlias] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { getAllInfo } = useWallet();

  // Alias availability check with debounce
  const checkAliasAvailability = useCallback(
    debounce(async (aliasToCheck: string) => {
      setIsCheckingAlias(true);
      try {
        const isAvailable = await checkAliasAvailabilityAction(aliasToCheck);
        setIsAliasAvailable(isAvailable);
      } catch (error) {
        console.error('Error checking alias availability:', error);
        setIsAliasAvailable(false);
      } finally {
        setIsCheckingAlias(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (alias) {
      checkAliasAvailability(alias);
    } else {
      setIsAliasAvailable(null);
    }
  }, [alias, checkAliasAvailability]);

  const handleCreateWallet = (event: React.FormEvent) => {
    event.preventDefault();

    if (!requestId) {
      toast.error('Request ID is missing. Please refresh the page.');
      return;
    }

    startTransition(async () => {
      try {
        await createWalletAction({
          alias,
          verificationCode,
          requestId,
        });
        toast.success('Wallet created successfully!');
        // Refresh the page to reflect updated user data
        router.refresh();
      } catch (error) {
        console.error('Error creating wallet:', error);
        toast.error('Failed to create wallet. Please try again.');
      }
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Create Your Wallet</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email and choose an alias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateWallet} className="space-y-4">
          <div>
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="alias">Alias</Label>
            <div className="relative">
              <Input
                id="alias"
                type="text"
                placeholder="Enter alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="pr-10"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {isCheckingAlias && (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {!isCheckingAlias && isAliasAvailable === true && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                {!isCheckingAlias && isAliasAvailable === false && (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={!isAliasAvailable || isPending}
          >
            {isPending ? 'Creating Wallet...' : 'Create Wallet'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
