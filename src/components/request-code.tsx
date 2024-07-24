import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function RequestCode({ setEmail, setRequestId, setCurrentStep, email = '' }: { 
  setEmail: (email: string) => void,
  setRequestId: (requestId: string) => void,
  setCurrentStep: (step: number) => void,
  email: string
}) {
  const [inputEmail, setInputEmail] = useState(email);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const createAccountPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/createWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: inputEmail }),
        });
        if (response.ok) {
          const result = await response.json();
          setEmail(result.email);
          setRequestId(result.requestId);
          setCurrentStep(2);
          resolve(true);
        } else {
          reject('Failed to create external wallet');
        }
      } catch (error) {
        reject('Failed to create external wallet');
      }
    });
  
    toast.promise(createAccountPromise, {
      pending: 'Creating external wallet...',
      success: 'External wallet created successfully!',
      error: 'Error creating external wallet',
    });
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputEmail(event.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Create Your External Wallet</CardTitle>
            <CardDescription>Provide your email to create a new external wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@email.com" 
                    value={inputEmail}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit}>Create Wallet</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}