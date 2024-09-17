// app/actions/getUserData.ts

'use server';

import { redirect } from 'next/navigation';
import { getUser, verifySession } from '@/lib/dal';
import { withLogging } from './logger';

export const getUserData = withLogging('getUserData', async () => {
  const session = await verifySession();
  if (!session) {
    redirect('/auth');
  }

  const user = await getUser(session.userId);
  return {
    id: user.id,
    email: user.email,
    isAdmin: !!user.isAdmin,
    isVerified: !!user.authToken,
  };
});
