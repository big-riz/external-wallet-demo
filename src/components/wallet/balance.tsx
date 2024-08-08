import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


interface UserBalanceProps {
  balances: UserBalance [] | undefined;
}

type UserBalance = {
  currencyCode: string;
  logoUrl: string;
  units: number;
  fiatCurrencyCode: string;
  fiatUnits: number;
}


export function UserBalance({ balances = [] }: UserBalanceProps) {
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
                <p><span className="font-medium">Currency:</span> {balance.currencyCode}</p>
                <p><span className="font-medium">Balance:</span> {balance.units} {balance.currencyCode}</p>
                <p><span className="font-medium">Fiat Equivalent:</span> {balance.fiatUnits} {balance.fiatCurrencyCode}</p>
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