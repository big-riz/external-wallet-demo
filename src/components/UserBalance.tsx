import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface UserBalanceProps {
  email: string;
}

interface UserBalance {
  currency: {
    code: string;
    logoUrl: string;
  };
  units: number;
  fiatEquivalent: {
    currencyCode: string;
    units: number;
  };
}

export function UserBalance({ email }: UserBalanceProps) {
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      setIsLoading(true);
      const response = await apiService.getUserBalances(email);
      if (response.data) {
        setBalances(response.data);
        setError(null);
      } else {
        setError('Failed to fetch user balances');
      }
      setIsLoading(false);
    };

    fetchBalances();
  }, [email]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Loading balances...</p>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : balances.length > 0 ? (
          <div className="space-y-4">
            {balances.map((balance, index) => (
              <div key={index} className="border-t pt-2 first:border-t-0 first:pt-0">
                <p><span className="font-medium">Currency:</span> {balance.currency.code}</p>
                <p><span className="font-medium">Balance:</span> {balance.units} {balance.currency.code}</p>
                <p><span className="font-medium">Fiat Equivalent:</span> {balance.fiatEquivalent.units} {balance.fiatEquivalent.currencyCode}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No balances found.</p>
        )}
      </CardContent>
    </Card>
  );
}