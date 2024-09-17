'use server';
import { getBalances } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'
import { withLogging } from './logger';

export const getUserBalances = withLogging('getBalances', async () => {
  const session = await verifySession()
  const user = await getUser(session.userId);
  if (!user.authToken) {
    return { error: 'User needs to verify email' };
  }
  const res = await getBalances(user.authToken);
  return res.items;
});