import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { apiService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface VerifyCodeProps {
  email: string;
  requestId: string;
  resetState: () => void;
}

export function VerifyCode({ email, requestId, resetState }: VerifyCodeProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const { token } = useAuth();

  const handleSetVerificationCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(event.target.value);
  }

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      const response = await apiService.verifyEmailCode(token as string, {
        verificationCode,
        requestId,
      });

      if (response.data) {
        toast.success('Code verified successfully!');
      }
    } catch (error) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= 3) {
        toast.error('Maximum attempts reached. Please start over.');
        resetState();
      } else {
        toast.error(`Verification failed. ${3 - newAttemptCount} attempts remaining.`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Verify Email: {email}</CardTitle>
            <CardDescription>
              Enter the verification code sent to your email. You have {3 - attemptCount} attempts remaining.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input 
                  id="verification-code" 
                  type="text" 
                  placeholder="Enter code" 
                  onChange={handleSetVerificationCode} 
                  value={verificationCode}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleVerify} disabled={attemptCount >= 3}>
              Verify
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}