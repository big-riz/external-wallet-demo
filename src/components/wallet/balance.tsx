import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserBalanceProps {
  balances: UserBalance [];
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

export function UserBalance({ balances }: UserBalanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Balances</CardTitle>
      </CardHeader>
      <CardContent>
     { balances.length > 0 ? (
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