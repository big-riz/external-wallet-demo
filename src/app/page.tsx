'use client';
import React, { useState } from 'react';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { RequestCode } from '@/components/request-code'
import { VerifyCode } from '@/components/verify-code'
import { AccountCreated } from '@/components/account-created'
import { Users } from '@/components/users';

export default function Home() {
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [useExternalWallet, setUseExternalWallet] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [currentView, setCurrentView] = useState('manageUsers'); // 'manageUsers' or 'createUser'

  const resetState = () => {
    setEmail('');
    setRequestId('');
    setCurrentStep(1);
    setUseExternalWallet(false);
    setAuthToken('');
  }

  const NavButton = ({ view, children }) => (
    <Button 
      variant={currentView === view ? "default" : "ghost"} 
      onClick={() => setCurrentView(view)}
      className={currentView === view ? "bg-primary text-primary-foreground" : ""}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b">
        <nav className="container px-4 md:px-6 flex items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="#" className="font-semibold text-lg z-10">
              Defi
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavButton view="manageUsers">Manage Users</NavButton>
              <NavButton view="createUser">Create User</NavButton>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline">
              <BellIcon className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </header>
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
          {currentView === 'manageUsers' && <Users />}
          {currentView === 'createUser' && (
            <div className="w-full max-w-md mx-auto">
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
          )}
        </div>
      </main>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="md:hidden">
          <div className="flex flex-col items-start gap-6 p-4">
            <Link href="#" className="font-semibold text-lg">
              Defi
            </Link>
            <div className="flex flex-col items-start gap-4">
              <NavButton view="manageUsers">Manage Users</NavButton>
              <NavButton view="createUser">Create User</NavButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function BellIcon(props) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}