'use server';

import { cookies } from 'next/headers'
import { withLogging } from './logger';
import { decrypt } from '@/lib/session'
import { SessionPayload } from '@/lib/definitions'
import { getUser as fetchUser } from '@/lib/db';

export const getUserDataWithoutRedirect = withLogging('getUserDataWithoutRedirect', async () => {
  const cookie = cookies().get('session')?.value

  try {
    const session = await decrypt(cookie) as SessionPayload;
    if (!session) {
      return null;
    }
    const user = await fetchUser(session.userId);
    return {
      id: user?.id,
      email: user?.email,
      isAdmin: !!user?.isAdmin,
      isVerified: !!user?.authToken,
    }

  } catch (error) {
    return null;
  }

});
