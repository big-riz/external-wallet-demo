import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UserProps {
  email: string;
  authToken: string;
  setCurrentView: (view: string) => void;
}

export function User({ email, authToken, setCurrentView }: UserProps) {
  return (
    <div className="w-full px-4 py-8 bg-background">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Email</h3>
              <p>{email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Auth Token</h3>
              <p className="break-all">{authToken}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setCurrentView('manageUsers')}>Back to Manage Users</Button>
        </CardFooter>
      </Card>
    </div>
  )
}