'use client';

import React from 'react';
import { DepositInfo } from '@/components/wallet/DepositInfo';
import { SendPayment } from '@/components/wallet/SendPayment';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Banknote, Send, History } from 'lucide-react';

interface TabsComponentProps {
  depositInfo: any;
  txHistory: any[];
}

export function TabsComponent({ depositInfo, txHistory }: TabsComponentProps) {
  return (
    <Tabs defaultValue="deposit">
      <TabsList className="mb-4">
        <TabsTrigger value="deposit">
          <div className="flex items-center space-x-2">
            <Banknote className="h-5 w-5" />
            <span>Deposit Info</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="send">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Money</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="history">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Transaction History</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="deposit">
        <DepositInfo depositInfo={depositInfo} />
      </TabsContent>

      <TabsContent value="send">
        <SendPayment />
      </TabsContent>

      <TabsContent value="history">
        <TransactionHistory transactions={txHistory} />
      </TabsContent>
    </Tabs>
  );
}
