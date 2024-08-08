import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  onWalletCreated: () => Promise<void>;
}

export function CreateWallet({ requestId }: CreateWalletProps) {
  const { user, token, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>(Step.VerifyEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [paymail, setPaymail] = useState('');
  const [isPaymailAvailable, setIsPaymailAvailable] = useState<boolean | null>(null);
  const [isCheckingPaymail, setIsCheckingPaymail] = useState(false);

  useEffect(() => {
    if (user && user.email && step === Step.SelectPaymail) {
      const suggestedPaymail = user.email.split('@')[0];
      setPaymail(suggestedPaymail);
      checkPaymailAvailability(suggestedPaymail);
    }
  }, [user, step]);

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

  const checkPaymailAvailability = useCallback(
    debounce(async (paymailToCheck: string) => {
      if (paymailToCheck.length === 0) {
        setIsPaymailAvailable(null);
        return;
      }

      setIsCheckingPaymail(true);
      const response = await apiService.checkAliasAvailability(paymailToCheck);
      setIsPaymailAvailable(response.data?.isAvailable ?? false);
      setIsCheckingPaymail(false);
    }, 300),
    []
  );

  useEffect(() => {
    if (paymail && step === Step.SelectPaymail) {
      checkPaymailAvailability(paymail);
    } else {
      setIsPaymailAvailable(null);
    }
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

    const response = await createWalletPromise;
    await refreshUser();


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
            <Button className="w-full" onClick={handleVerifyEmail}>Verify Email</Button>
          </div>
        )}
        {step === Step.SelectPaymail && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymail">Paymail</Label>
              <Input 
                id="paymail" 
                type="text" 
                placeholder="Enter paymail" 
                value={paymail}
                onChange={(e) => setPaymail(e.target.value)}
              />
              {isCheckingPaymail && <p className="text-sm text-gray-500">Checking availability...</p>}
              {!isCheckingPaymail && isPaymailAvailable !== null && (
                <p className={`text-sm ${isPaymailAvailable ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                  {isPaymailAvailable ? (
                    <>
                      <Check size={16} className="mr-1" /> Paymail is available
                    </>
                  ) : (
                    <>
                      <X size={16} className="mr-1" /> Paymail is unavailable
                    </>
                  )}
                </p>
              )}
            </div>
            <Button className="w-full" onClick={handleCreateWallet} disabled={!isPaymailAvailable}>Create Wallet</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}