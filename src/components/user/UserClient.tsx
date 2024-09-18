'use client';

import { useWallet } from '@/app/context/WalletContext';
import { VerifyEmail } from '@/components/user/VerifyEmail';
import { Types } from '@handcash/handcash-sdk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Send, History } from "lucide-react";
import { DepositInfo } from '@/components/wallet/DepositInfo';
import { SendPayment } from '@/components/wallet/SendPayment';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { ToastContainer } from '../Toaster';

interface UserPageClientProps {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
    isVerified: boolean;
  };
  txHistory: Types.PaymentResult[];
  txHistoryError: boolean;
  depositLink: string;
}

export default function UserPageClient({ user, txHistory, depositLink }: UserPageClientProps) {
  const { isWalletConnected } = useWallet();

  if (!isWalletConnected) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">User Information</h1>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <VerifyEmail />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        
        {/* Main content with tabs */}
        <main className="flex-1 mt-8 lg:mt-0">
          <ToastContainer />
          <Tabs defaultValue="deposit" className="space-y-4">
            <TabsList>
              <TabsTrigger value="deposit">
                <Banknote className="mr-2 h-4 w-4" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="send">
                <Send className="mr-2 h-4 w-4" />
                Send
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <DepositInfo depositLink={depositLink}/>
            </TabsContent>
            <TabsContent value="send">
              <SendPayment />
            </TabsContent>
            <TabsContent value="history">
              <TransactionHistory transactions={txHistory} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
