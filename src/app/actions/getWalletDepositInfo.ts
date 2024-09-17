'use server';
import { getDepositInfo } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'
import { deleteUserAuth } from '@/lib/db';

export async function getWalletDepositInfo() {
  const session = await verifySession()
  const user = await getUser(session.userId);
  if (!user.authToken) {
    return { error: 'User needs to verify email' };
  }
  try {
    const res = await getDepositInfo(user.authToken);
    return res;
  } catch(e: any) {
    await deleteUserAuth(user.id);
    return { error: e.message };
  }
}
