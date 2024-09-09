import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { Check, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

enum Step {
  VerifyEmail,
  SelectPaymail,
}

interface CreateWalletProps {
  requestId: string;
  onWalletCreated: () => void;
}

export function CreateWallet({ requestId, onWalletCreated }: CreateWalletProps) {
  const { user, token } = useAuth();
  const [step, setStep] = useState<Step>(Step.VerifyEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [paymail, setPaymail] = useState('');
  const [isPaymailAvailable, setIsPaymailAvailable] = useState<boolean | null>(null);
  const [isCheckingPaymail, setIsCheckingPaymail] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPaymailAvailability = useCallback(debounce(async (paymailToCheck: string) => {
    setIsCheckingPaymail(true);
    try {
      const response = await apiService.checkAliasAvailability(paymailToCheck);
      setIsPaymailAvailable(response.data?.isAvailable ?? false);
    } catch (error) {
      console.error('Error checking paymail availability:', error);
      setIsPaymailAvailable(false);
    } finally {
      setIsCheckingPaymail(false);
    }
  }, 300), []);

  const handleVerifyEmail = async () => {
    if (!token || !requestId) {
      toast.error('Authentication token or request ID not found');
      return;
    }

    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      await apiService.verifyEmailCode(token, { verificationCode, requestId });
      setStep(Step.SelectPaymail);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error('Email verification failed. Please try again.');
    }
  };

  useEffect(() => {
    if (user?.email && step === Step.SelectPaymail) {
      const suggestedPaymail = user.email.split('@')[0];
      setPaymail(suggestedPaymail);
      checkPaymailAvailability(suggestedPaymail);
    }
  }, [user, step, checkPaymailAvailability]);

  useEffect(() => {
    const delayedCheck = setTimeout(() => {
      if (paymail && step === Step.SelectPaymail) {
        checkPaymailAvailability(paymail);
      } else {
        setIsPaymailAvailable(null);
      }
    }, 300);

    return () => clearTimeout(delayedCheck);
  }, [paymail, step, checkPaymailAvailability]);

  const handleCreateWallet = async () => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (!paymail) {
      toast.error('Please enter a paymail');
      return;
    }

    if (!isPaymailAvailable) {
      toast.error('Please choose an available paymail');
      return;
    }

    const createWalletPromise = apiService.createWallet(token, paymail);

    toast.promise(createWalletPromise, {
      pending: 'Creating wallet...',
      success: 'Wallet created successfully!',
      error: 'Failed to create wallet'
    });

    try {
      await createWalletPromise;
      onWalletCreated();
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Create Your Wallet</CardTitle>
        <CardDescription>
          {step === Step.VerifyEmail && "Enter the verification code sent to your email."}
          {step === Step.SelectPaymail && "Choose a paymail for your new wallet."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === Step.VerifyEmail && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleVerifyEmail}>
              Verify Email
            </Button>
          </div>
        )}
        {step === Step.SelectPaymail && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymail">Paymail</Label>
              <div className="relative">
                <Input
                  id="paymail"
                  type="text"
                  placeholder="Enter paymail"
                  value={paymail}
                  onChange={(e) => setPaymail(e.target.value)}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isCheckingPaymail && (
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
                  {!isCheckingPaymail && isPaymailAvailable === true && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {!isCheckingPaymail && isPaymailAvailable === false && (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateWallet}
              disabled={!isPaymailAvailable}
            >
              Create Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}