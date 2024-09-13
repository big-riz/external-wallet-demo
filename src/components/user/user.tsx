import { redirect } from 'next/navigation';
import { getUserData } from '@/app/actions/getUserData';
import { getWalletDepositInfo } from '@/app/actions/getWalletDepositInfo';
import { getUserBalances } from '@/app/actions/getUserBalances';
import { getTransactionHistory } from '@/app/actions/getTransactionHistory';
import { UserBalance } from '@/components/wallet/UserBalance';
import { TabsComponent } from '@/components/wallet/TabsComponent';
import { VerifyEmail } from '@/components/user/VerifyEmail';

export default async function UserPage() {
  const user = await getUserData();

  if (!user) {
    redirect('/auth');
  }

  if (!user.isVerified) {
    return (
      <div className="w-full px-4 py-8 bg-background">
        <h1 className="text-2xl font-bold mb-4">User Information</h1>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <VerifyEmail />
      </div>
    );
  }

  // Fetch data in parallel
  const [depositInfo, balances, txHistory] = await Promise.all([
    getWalletDepositInfo(),
    getUserBalances(),
    getTransactionHistory(),
  ]);

  return (
    <div className="w-full px-4 py-8 bg-background">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        {balances && <UserBalance balances={balances} />}
      </div>

      {/* Tabs */}
      <TabsComponent depositInfo={depositInfo} txHistory={txHistory} />
    </div>
  );
}
