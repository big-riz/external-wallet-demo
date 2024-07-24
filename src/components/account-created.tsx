'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link';

interface AccountCreatedProps {
  email: string;
  resetState: () => void;
  setCurrentView: (view: string) => void;
}

export function AccountCreated({ email, resetState, setCurrentView }: AccountCreatedProps) {
  const handleManageUsers = () => {
    resetState();
    setCurrentView('manageUsers');
  };

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Your account has been created with the email:
              <br />
              <span className="font-semibold">{email}</span>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              You can now manage your account and start using our services.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleManageUsers}>
              Manage Users
            </Button>
            <Button variant="outline" className="w-full" onClick={resetState}>
              Create Another Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}