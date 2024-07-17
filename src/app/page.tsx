'use client';

import { RequestCode } from '@/components/request-code'
import { VerifyCode } from '@/components/verify-code'
import { AccountCreated } from '@/components/account-created'
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [useExternalWallet, setUseExternalWallet] = useState(false);
  const [authToken, setAuthToken] = useState('');

  const resetState = () => {
    setEmail('');
    setRequestId('');
    setCurrentStep(1);
    setUseExternalWallet(false);
    setAuthToken('');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-start pt-[calc(100vh/6)] px-4">
        <div className="w-full max-w-md">
          {currentStep === 1 && (
            <RequestCode
              email={email}
              setEmail={setEmail}
              setRequestId={setRequestId}
              setCurrentStep={setCurrentStep}
              setUseExternalWallet={setUseExternalWallet}
            />
          )}
          {currentStep === 2 && (
            <VerifyCode
              email={email}
              setAuthToken={setAuthToken}
              requestId={requestId}
              setCurrentStep={setCurrentStep}
              useExternalWallet={useExternalWallet}
              resetData={resetState}
            />
          )}
          {currentStep === 3 && authToken && (
            <AccountCreated 
              authToken={authToken} 
              isExternal={useExternalWallet} 
              resetState={resetState} 
            />
          )}
        </div>
      </main>
    </div>
  )
}