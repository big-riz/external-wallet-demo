'use server';

import { redirect } from 'next/navigation';
import { getUser, verifySession } from '@/lib/dal';

export async function getUserData() {
  const session = await verifySession();

  if (!session) {
    redirect('/auth');
  }

  const user = await getUser(session.userId);
  return { id: user.id, email: user.email, isAdmin: !!user.isAdmin, isVerified: !!user.authToken };
}