'use client';

import React, { useState, useEffect } from 'react';
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


export function UserPage() {
  const { user, token } = useAuth();
  const [txHistory, setTxHistory] = useState<Types.PaymentResult[]>([]);
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
        const historyResponse = await apiService.getTransactionHistory(token)
        setTxHistory(historyResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tx history data:', err);
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
          <CreateWallet requestId={emailCodeRequestId as string} />
        </div>
      )}

      {user.walletId && (
        <>
          {isLoading ? (
            <div className="mt-4">Loading user data...</div>
          ) : error ? (
            <div className="mt-4 text-red-500">Error: {error}</div>
          ) : user ? (
            <div className="mt-8 space-y-8">
              <DepositInfo depositInfo={user.depositInfo} />
              <UserBalance balances={user.balances} />
              <TransactionHistory transactions={txHistory} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}