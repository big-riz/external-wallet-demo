'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export function RequestCode({ setEmail, setRequestId, setCurrentStep, setUseExternalWallet, email = ''}: { 
  setEmail: any, setRequestId: any, setCurrentStep: any, setUseExternalWallet: any, email: string }) {
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const createAccountPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/createWallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (response.ok) {
          const result = await response.json();
          setEmail(result.email);
          setRequestId(result.requestId);
          setCurrentStep(2);
          resolve(true);
        } else {
          reject('Failed to create app wallet');
        }
      } catch (error) {
        reject('Failed to create app wallet');
      }
    });
  
    toast.promise(createAccountPromise, {
      pending: 'Creating app wallet...',
      success: 'App wallet created successfully!',
      error: 'Error creating app wallet',
    });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleRadioChange = (event) => {
    setUseExternalWallet(event.target.value === 'external');
  }


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md"><div />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Create Your Wallet</CardTitle>
            <CardDescription>Choose between an App Created Wallet or an External Wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="app"  onClick={handleRadioChange}>
              <div className="grid grid-cols-2 gap-4">
                <Label
                  htmlFor="app"
                  className="flex flex-col items-center justify-between p-4 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <WalletIcon className="mb-3 h-6 w-6" />
                  App Created
                  <RadioGroupItem value="app" id="app" className="peer sr-only" />
                </Label>
                <Label
                  htmlFor="external"
                  className="flex flex-col items-center justify-between p-4 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <KeyIcon className="mb-3 h-6 w-6" />
                  External
                  <RadioGroupItem value="external" id="external" className="peer sr-only" />
                </Label>
              </div>
            </RadioGroup>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@email.com" onChange={handleEmailChange}/>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit}>Continue</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function KeyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  )
}


function WalletIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}


function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
