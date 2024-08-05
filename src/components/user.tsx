import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiService } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { UserBalance } from './UserBalance';
import { TransactionHistory } from './TransactionHistory';

interface UserProps {
  email: string;
  authToken: string;
  setCurrentView: (view: string) => void;
}

interface DepositInfo {
  id: string;
  alias: string;
  paymail: string;
  base58Address: string;
}

export function User({ email, authToken, setCurrentView }: UserProps) {
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepositInfo = async () => {
      setIsLoading(true);
      const response = await apiService.getDepositInfo(email);
      if (response.data) {
        setDepositInfo(response.data);
        setError(null);
      } else {
        setError('Failed to fetch deposit info');
      }
      setIsLoading(false);
    };

    fetchDepositInfo();
  }, [email]);

  return (
    <div className="w-full px-4 py-8 bg-background">
      <Card className="w-full max-w-2xl mx-auto mb-8">
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
            <div>
              <h3 className="text-lg font-semibold">Deposit Information</h3>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Loading deposit info...</p>
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : depositInfo ? (
                <div className="space-y-2">
                  <p><span className="font-medium">ID:</span> {depositInfo.id}</p>
                  <p><span className="font-medium">Alias:</span> {depositInfo.alias}</p>
                  <p><span className="font-medium">Paymail:</span> {depositInfo.paymail}</p>
                  <p><span className="font-medium">Base58 Address:</span> {depositInfo.base58Address}</p>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setCurrentView('manageUsers')}>Back to Manage Users</Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-8">
        <UserBalance email={email} />
        <TransactionHistory email={email} />
      </div>
    </div>
  )
}