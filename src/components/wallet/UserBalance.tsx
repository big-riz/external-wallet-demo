import React from 'react';
import { Types } from '@handcash/handcash-sdk';

interface UserBalanceProps {
  balances: Types.UserBalance[];
}

export function UserBalance({ balances = [] }: UserBalanceProps) {
  const bsvBalance = balances.find(
    (balance) => balance.currency.code === 'BSV'
  );

  if (!bsvBalance) {
    return null;
  }

  // Format the BSV amount with up to 8 decimal places
  const bsvFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });

  // Format the fiat amount using the appropriate currency code
  const fiatFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: bsvBalance.fiatEquivalent.currencyCode,
  });

  const bsvUnitsFormatted = bsvFormatter.format(bsvBalance.units);
  const fiatUnitsFormatted = fiatFormatter.format(bsvBalance.fiatEquivalent.units);

  return (
    <div className="bg-white shadow-md rounded p-4 flex items-center space-x-4">
      {/* BSV Logo */}
      <img
        src={bsvBalance.currency.logoUrl}
        alt="BSV Logo"
        className="h-12 w-12"
      />
      {/* Balance Details */}
      <div>
        <p className="text-gray-500 text-sm">Balance</p>
        <p className="text-xl font-bold">
          {fiatUnitsFormatted} USD
        </p>
        <p className="text-gray-500">
          = {bsvUnitsFormatted} {bsvBalance.currency.code}
        </p>
      </div>
    </div>
  );
}
