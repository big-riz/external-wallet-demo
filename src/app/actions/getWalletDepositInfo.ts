'use server';
import { getDepositInfo } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'

export async function getWalletDepositInfo() {
  const session = await verifySession()
  const user = await getUser(session.userId);
  if (!user.authToken) {
    return { error: 'User needs to verify email' };
  }
  return getDepositInfo(user.authToken);
}
