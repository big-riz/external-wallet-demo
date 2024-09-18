'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Types } from '@handcash/handcash-sdk';

interface WalletInfo {
  isWalletConnected: boolean;
  depositInfo: Types.DepositInfo | undefined;
  balances: Types.UserBalance[];
}

interface WalletContextType extends WalletInfo {
  refreshBalances: () => Promise<void>;
  getAllInfo: () => Promise<void>;
  getBSVBalance: () => Types.UserBalance | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  initialWalletInfo: WalletInfo;
  refreshBalancesActionName: string;
  getAllInfoActionName: string;
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  initialWalletInfo,
  refreshBalancesActionName,
  getAllInfoActionName,
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(initialWalletInfo);

  useEffect(() => {
    setWalletInfo(initialWalletInfo);
  }, [initialWalletInfo]);

  const refreshBalances = useCallback(async () => {
    try {
      const { getUserBalances } = await import(`@/app/actions/wallet/${refreshBalancesActionName}`);
      const newBalances = await getUserBalances();
      setWalletInfo(prev => ({ ...prev, balances: newBalances }));
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  }, [refreshBalancesActionName]);

  const getAllInfo = useCallback(async () => {
    try {
      const { fetchWalletInfo } = await import(`@/app/actions/wallet/${getAllInfoActionName}`);
      const newInfo = await fetchWalletInfo();
      setWalletInfo(newInfo);
    } catch (error) {
      console.error('Error fetching all wallet info:', error);
    }
  }, [getAllInfoActionName]);

  const getBSVBalance = useCallback(() => {
    return walletInfo.balances.find(balance => balance.currency.code === 'BSV');
  }, [walletInfo.balances]);

  const value: WalletContextType = {
    ...walletInfo,
    refreshBalances,
    getAllInfo,
    getBSVBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};