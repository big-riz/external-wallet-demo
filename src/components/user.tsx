'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { UserBalance } from './UserBalance';
import { TransactionHistory } from './TransactionHistory';
import { Types } from '@handcash/handcash-sdk';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { CreateWallet } from './create-wallet';
import { toast } from 'react-toastify';
import { DepositInfo } from './user/deposit-info';

interface UserData {
  balances: Types.UserBalance[],
  transactionHistory: Types.PaymentResult[],
  depositInfo: Types.DepositInfo,
}

export function UserPage() {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [emailCodeRequestId, setEmailCodeRequestId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth');
      return;
    }

    const fetchUserData = async () => {
      if (!user.walletId) {
        return;
      }

      setIsLoading(true);
      try {
        const [balanceResponse, historyResponse, depositResponse] = await Promise.all([
          apiService.getUserBalances(token),
          apiService.getTransactionHistory(token),
          apiService.getDepositInfo(token),
        ]);
        setUserData({
          balances: balanceResponse.data as Types.UserBalance[],
          transactionHistory: historyResponse.data as Types.PaymentResult[],
          depositInfo: depositResponse.data as Types.DepositInfo,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching user data');
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [user, token, router]);

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
          <p>You don't have a wallet yet.</p>
          <Button onClick={handleVerifyEmail} className="mt-2">
            Verify Email
          </Button>
        </div>
      )}

      {showCreateWallet && (
        <div className="mt-4">
          <CreateWallet requestId={emailCodeRequestId} />
        </div>
      )}

      {user.walletId && (
        <>
          {isLoading ? (
            <div className="mt-4">Loading user data...</div>
          ) : error ? (
            <div className="mt-4 text-red-500">Error: {error}</div>
          ) : userData ? (
            <div className="mt-8 space-y-8">
              <DepositInfo depositInfo={userData.depositInfo} />
              <UserBalance balances={userData.balances} />
              <TransactionHistory transactions={userData.transactionHistory} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}