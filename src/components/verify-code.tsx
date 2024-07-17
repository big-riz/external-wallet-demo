'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from 'react';
import { toast } from 'react-toastify';

export function VerifyCode({ email, requestId, setCurrentStep, useExternalWallet, setAuthToken, resetData}: { email: string, requestId: string, setCurrentStep: any, useExternalWallet: boolean, setAuthToken: any, resetData: any}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [alias, setAlias] = useState('');

  const handleSetVerificationCode = (event) => {
    setVerificationCode(event.target.value);
  }

  const handleSetAlias = (event) => {
    setAlias(event.target.value);
  }

  const handleVerify = async () => {
    const verifyPromise = new Promise(async (resolve, reject) => {
      try {
        const verifyData = {
          email,
          verificationCode,
          requestId,
          ...(useExternalWallet && { alias }),
        };

        const response = await fetch('/api/verifyWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyData),
        });

        if (response.ok) {
          const result = await response.json();
          setAuthToken(result.authToken);
          setCurrentStep(3);
          resolve('Wallet verified successfully!');
        } else {
          reject('Failed to verify wallet');
        }
      } catch (error) {
        reject('Failed to verify wallet');
      }
    });

    toast.promise(verifyPromise, {
      pending: 'Verifying wallet...',
      success: 'Wallet verified successfully!',
      error: 'Error verifying wallet',
    });
  };
  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Verify Email: {email}</CardTitle>
            <CardDescription>
              Enter the verification code and alias for your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input id="verification-code" type="text" placeholder="Enter code" onChange={handleSetVerificationCode} />
              </div>
              { useExternalWallet && ( <div>
                <Label htmlFor="alias">Alias</Label>
                <Input id="alias" type="text" placeholder="Enter alias" onChange={handleSetAlias} />
              </div> )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleVerify}>Verify</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
