import { redirect } from 'next/navigation';
import { getUserData } from '@/app/actions/getUserData';
import { getTransactionHistory } from '@/app/actions/getTransactionHistory';
import { Types } from '@handcash/handcash-sdk';
import UserPageClient from '@/components/user/UserClient';
import { CreatePaymentRequest } from '@/app/actions/createPaymentRequest';

export default async function UserPage() {
  const user = await getUserData();
  const depositLink = await CreatePaymentRequest();
  if (!user) {
    redirect('/auth');
  }

  const txHistoryResult = await getTransactionHistory();
  const txHistory: Types.PaymentResult[] = Array.isArray(txHistoryResult) ? txHistoryResult : [];

  return (
    <UserPageClient user={user} depositLink={depositLink} txHistory={txHistory} txHistoryError={'error' in txHistoryResult} />
  );
}