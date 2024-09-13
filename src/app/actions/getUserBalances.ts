'use server';
import { getBalances } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'

export async function getUserBalances() {
  const session = await verifySession()
  const user = await getUser(session.userId);
  if (!user.authToken) {
    return { error: 'User needs to verify email' };
  }
  const res = await getBalances(user.authToken);
  return res.items;
}
