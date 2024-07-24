import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { Check, X } from 'lucide-react';

interface VerifyCodeProps {
  email: string;
  requestId: string;
  setCurrentStep: (step: number) => void;
  resetData: () => void;
  setAuthTokens: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function VerifyCode({ email, requestId, setCurrentStep, resetData, setAuthTokens }: VerifyCodeProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [alias, setAlias] = useState('');
  const [isAliasAvailable, setIsAliasAvailable] = useState<boolean | null>(null);
  const [isCheckingAlias, setIsCheckingAlias] = useState(false);

  const checkAliasAvailability = useCallback(
    debounce(async (aliasToCheck: string) => {
      if (aliasToCheck.length === 0) {
        setIsAliasAvailable(null);
        return;
      }

      setIsCheckingAlias(true);
      try {
        const response = await fetch('/api/aliasAvailability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alias: aliasToCheck }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAliasAvailable(data.isAvailable);
        } else {
          console.error('Failed to check alias availability');
          setIsAliasAvailable(null);
        }
      } catch (error) {
        console.error('Error checking alias availability:', error);
        setIsAliasAvailable(null);
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

  const handleSetVerificationCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(event.target.value);
  }

  const handleSetAlias = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlias(event.target.value);
  }

  const handleVerify = async () => {
    if (!verificationCode || !alias) {
      toast.error('Please enter both verification code and alias');
      return;
    }

    if (!isAliasAvailable) {
      toast.error('Please choose an available alias');
      return;
    }

    const verifyPromise = new Promise(async (resolve, reject) => {
      try {
        const verifyData = {
          email,
          verificationCode,
          requestId,
          alias,
        };

        const response = await fetch('/api/verifyWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyData),
        });

        if (response.ok) {
          const data = await response.json();
          setAuthTokens(prevTokens => ({
            ...prevTokens,
            [email]: data.authToken
          }));
          setCurrentStep(3);
          resolve('Wallet verified successfully!');
        } else {
          const errorData = await response.json();
          reject(errorData.message || 'Failed to verify wallet');
        }
      } catch (error) {
        reject('Failed to verify wallet');
      }
    });

    toast.promise(verifyPromise, {
      pending: 'Verifying wallet...',
      success: 'Wallet verified successfully!',
      error: {
        render({ data }) {
          return typeof data === 'string' ? data : 'Error verifying wallet';
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
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
                <Input 
                  id="verification-code" 
                  type="text" 
                  placeholder="Enter code" 
                  onChange={handleSetVerificationCode} 
                  value={verificationCode}
                />
              </div>
              <div>
                <Label htmlFor="alias">Alias</Label>
                <Input 
                  id="alias" 
                  type="text" 
                  placeholder="Enter alias" 
                  onChange={handleSetAlias} 
                  value={alias}
                />
                {isCheckingAlias && <p className="text-sm text-gray-500">Checking availability...</p>}
                {!isCheckingAlias && isAliasAvailable !== null && (
                  <p className={`text-sm ${isAliasAvailable ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                    {isAliasAvailable ? (
                      <>
                        <Check size={16} className="mr-1" /> Alias is available
                      </>
                    ) : (
                      <>
                        <X size={16} className="mr-1" /> Alias is unavailable
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleVerify} disabled={!isAliasAvailable}>Verify</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}