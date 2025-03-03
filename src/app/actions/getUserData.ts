// app/actions/getUserData.ts

'use server';

import { redirect } from 'next/navigation';
import { getUser, verifySession } from '@/lib/dal';
import { withLogging } from './logger';

export const getUserData = withLogging('getUserData', async () => {
  const session = await verifySession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  if (!session.userId) {
    throw new Error('User ID not found in session');
  }

  const user = await getUser(session.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    isAdmin: !!user.isAdmin,
    isVerified: !!user.authToken,
  };
});
