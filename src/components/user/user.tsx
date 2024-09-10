'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { UserBalance } from '@/components/wallet/balance';
import { TransactionHistory } from '@/components/wallet/tx-history';
import { Types } from '@handcash/handcash-sdk';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { CreateWallet } from '../wallet/create-wallet';
import { toast } from 'react-toastify';
import { DepositInfo } from '@/components/wallet/deposit-info';
import { SendPayment } from '@/components/wallet/pay';

export function UserPage() {
  const { user, token, refreshUser } = useAuth();
  const [txHistory, setTxHistory] = useState<Types.PaymentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [emailCodeRequestId, setEmailCodeRequestId] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    if (!user || !user.walletId || !token) {
      return;
    }

    setIsLoading(true);
    try {
      const historyResponse = await apiService.getTransactionHistory(token);
      setTxHistory(historyResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tx history data:', err);
      setError('An error occurred while fetching user data');
    }
    setIsLoading(false);
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth');
      return;
    }

    fetchUserData();
  }, [user, token, router, fetchUserData]);

  const handleRefreshUser = async () => {
    await refreshUser();
    fetchUserData();
  };

  const handleVerifyEmail = async () => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const response = await apiService.requestEmailCode(token);
      if (response.data && response.data.requestId) {
        setEmailCodeRequestId(response.data.requestId);
        setShowCreateWallet(true);
        toast.success('Verification code sent to your email');
      } else {
        toast.error('Failed to request email verification');
      }
    } catch (error) {
      console.error('Error requesting email code:', error);
      toast.error('Failed to request email verification');
    }
  };

  const handleWalletCreated = async () => {
    await refreshUser(); // Refresh user data in auth context
    setShowCreateWallet(false); // Hide the create wallet form
    fetchUserData(); // Fetch updated user data
    toast.success('Wallet created successfully!');
  };

  if (!user || !token) {
    return null; // The useEffect will handle routing to /auth
  }

  return (
    <div className="w-full px-4 py-8 bg-background">
      <h1 className="text-2xl font-bold mb-4">User Information</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Attribute</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{user.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {!user.walletId && !showCreateWallet && (
        <div className="mt-4">
          <p>You don&apos;t have a wallet yet.</p>
          <Button onClick={handleVerifyEmail} className="mt-2">
            Verify Email
          </Button>
        </div>
      )}

      {showCreateWallet && (
        <div className="mt-4">
          <CreateWallet 
            requestId={emailCodeRequestId as string} 
            onWalletCreated={handleWalletCreated}
          />
        </div>
      )}

      {user.walletId && (
        <>
          {isLoading ? (
            <div className="mt-4">Loading user data...</div>
          ) : error ? (
            <div className="mt-4 text-red-500">Error: {error}</div>
          ) : (
            <div className="mt-8 space-y-8">
              <SendPayment refreshUser={handleRefreshUser} />
               {user.depositInfo && <DepositInfo depositInfo={user.depositInfo} />}
              <UserBalance balances={user.balances} />
              <TransactionHistory transactions={txHistory} />
            </div>
          )}
        </>
      )}
    </div>
  );
}