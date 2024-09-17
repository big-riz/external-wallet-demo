import { redirect } from 'next/navigation';
import { getUserData } from '@/app/actions/getUserData';
import { getTransactionHistory } from '@/app/actions/getTransactionHistory';
import { Types } from '@handcash/handcash-sdk';
import UserPageClient from '@/components/user/UserClient';

export default async function UserPage() {
  const user = await getUserData();
  if (!user) {
    redirect('/auth');
  }

  const txHistoryResult = await getTransactionHistory();
  const txHistory: Types.PaymentResult[] = Array.isArray(txHistoryResult) ? txHistoryResult : [];

  return (
    <UserPageClient user={user} txHistory={txHistory} txHistoryError={'error' in txHistoryResult} />
  );
}