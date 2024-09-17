'use client';

import { useWallet } from '@/app/context/WalletContext';
import { UserBalance } from '@/components/wallet/UserBalance';
import { TabsComponent } from '@/components/wallet/TabsComponent';
import { VerifyEmail } from '@/components/user/VerifyEmail';
import { Types } from '@handcash/handcash-sdk';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

interface UserPageClientProps {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
    isVerified: boolean;
  };
  txHistory: Types.PaymentResult[];
  txHistoryError: boolean;
}

export default function UserPageClient({ user, txHistory }: UserPageClientProps) {
  const { isWalletConnected, balances, depositInfo } = useWallet();


  if (!isWalletConnected) {
    return (
      <div className="w-full px-4 py-8 bg-background">
        <h1 className="text-2xl font-bold mb-4">User Information</h1>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <VerifyEmail />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        {balances && <UserBalance balances={balances} />}
      </div>
      <TabsComponent depositInfo={depositInfo} txHistory={txHistory} />
    </div>
  );
}