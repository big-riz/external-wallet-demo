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
import { User } from '@/components/user';
import { AdminLogin } from '@/components/admin-login';

export default function Home() {
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [currentView, setCurrentView] = useState('createUser');
  const [selectedUser, setSelectedUser] = useState<{ email: string; authToken: string } | null>(null);
  const [authTokens, setAuthTokens] = useState<Record<string, string>>({});
  const [adminToken, setAdminToken] = useState('');

  const resetState = () => {
    setEmail('');
    setRequestId('');
    setCurrentStep(1);
  }

  const handleLogout = () => {
    setAdminToken('');
    setCurrentView('createUser');
  }

  const NavButton = ({ view, children }: {
    view: string;
    children: React.ReactNode;
  }) => (
    <Button 
      variant={currentView === view ? "default" : "ghost"} 
      onClick={() => {
        if (view === 'manageUsers' && !adminToken) {
          setCurrentView('adminLogin');
        } else {
          setCurrentView(view);
        }
      }}
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
              <NavButton view="createUser">Create User</NavButton>
              <NavButton view="manageUsers">Manage Users</NavButton>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {adminToken && (
              <>
                <span className="text-sm text-muted-foreground">Admin</span>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            )}
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </header>
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
          {currentView === 'adminLogin' && (
            <AdminLogin setAdminToken={setAdminToken} setCurrentView={setCurrentView} />
          )}
          {currentView === 'manageUsers' && adminToken && (
            <Users 
              authTokens={authTokens}
              setAuthTokens={setAuthTokens}
              setSelectedUser={setSelectedUser} 
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'userDetails' && selectedUser && (
            <User
              email={selectedUser.email}
              authToken={selectedUser.authToken}
              setCurrentView={setCurrentView}
            />
          )}
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
                  resetData={resetState}
                  setAuthTokens={setAuthTokens}
                />
              )}
              {currentStep === 3 && authTokens[email] && (
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
              <NavButton view="createUser">Create User</NavButton>
              <NavButton view="manageUsers">Manage Users</NavButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
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