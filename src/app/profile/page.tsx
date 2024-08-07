'use client';
import React, { useState } from 'react';
import { RequestCode } from '@/components/request-code'
import { VerifyCode } from '@/components/verify-code'
import { AccountCreated } from '@/components/account-created'
import { Users } from '@/components/users';
// import { User } from '@/components/user';
import { AdminLogin } from '@/components/admin-login';
import { CreateAccount } from '@/components/create-account';
import { useProtectedRoute } from '@/lib/auth-context';

export default function Home() {
  useProtectedRoute();
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [currentView, setCurrentView] = useState('createUser');
  const [selectedUser, setSelectedUser] = useState<{ email: string; authToken: string } | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const resetState = () => {
    setEmail('');
    setRequestId('');
    setCurrentStep(1);
    setIsNewUser(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
          {currentView === 'adminLogin' && (
            <AdminLogin setAdminToken={setAdminToken} setCurrentView={setCurrentView} />
          )}
          {currentView === 'manageUsers' && adminToken && (
            <Users 
              adminToken={adminToken}
              setSelectedUser={setSelectedUser} 
              setCurrentView={setCurrentView}
            />
          )}
          {/* {currentView === 'userDetails' && selectedUser && (
            <User
              email={selectedUser.email}
              authToken={selectedUser.authToken}
              setCurrentView={setCurrentView}
            />
          )} */}
          {currentView === 'createUser' && (
            <div className="w-full max-w-md mx-auto">
              {currentStep === 1 && (
                <RequestCode
                  email={email}
                  setEmail={setEmail}
                  setRequestId={setRequestId}
                  setCurrentStep={setCurrentStep}
                />
              )}
              {currentStep === 2 && (
                <VerifyCode
                  email={email}
                  requestId={requestId}
                  setCurrentStep={setCurrentStep}
                  setIsNewUser={setIsNewUser}
                  resetState={resetState}
                />
              )}
              {currentStep === 3 && isNewUser && (
                <CreateAccount
                  email={email}
                  setCurrentStep={setCurrentStep}
                />
              )}
              {currentStep === 4 && (
                <AccountCreated 
                  email={email}
                  resetState={resetState} 
                  setCurrentView={setCurrentView}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}