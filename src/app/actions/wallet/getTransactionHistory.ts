'use server';
import { getTransactionHistory as fetchTransactionHistory } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'

export async function getTransactionHistory() {
  const session = await verifySession()
  const user = await getUser(session.userId);
  if (!user.authToken) {
    return { error: 'User needs to verify email' };
  }
  const transactions = await fetchTransactionHistory(user.authToken);
  return transactions;
}
