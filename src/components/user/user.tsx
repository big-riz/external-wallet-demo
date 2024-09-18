import { redirect } from 'next/navigation';
import { getUserData } from '@/app/actions/getUserData';
import { getTransactionHistory } from '@/app/actions/wallet/getTransactionHistory';
import { Types } from '@handcash/handcash-sdk';
import UserPageClient from '@/components/user/UserClient';
import { CreatePaymentRequest } from '@/app/actions/wallet/createPaymentRequest';

export default async function UserPage() {
  const user = await getUserData();
  const depositLinkResult = await CreatePaymentRequest();

  if (!user) {
    redirect('/auth');
  }

  const depositLink = typeof depositLinkResult === 'string' ? depositLinkResult : '';


  const txHistoryResult = await getTransactionHistory();
  const txHistory: Types.PaymentResult[] = Array.isArray(txHistoryResult) ? txHistoryResult : [];

  return (
    <UserPageClient user={user} depositLink={depositLink} txHistory={txHistory} txHistoryError={'error' in txHistoryResult} />
  );
}