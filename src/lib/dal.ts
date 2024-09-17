'use server';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { decrypt } from '@/lib/session'
import { SessionPayload } from '@/lib/definitions'
import { getUser as fetchUser } from '@/lib/db';


export const verifySession = cache(async () => {
  const cookie = cookies().get('session')?.value
  if (!cookie) {
    redirect('/auth')
  }

  let session: SessionPayload | null;
  try {
    session = await decrypt(cookie) as SessionPayload;
  } catch (error) {
    console.error('Error decrypting session:', error);
    session = null;
  }

  if (!isValidSession(session)) {
    redirect('/auth')
  }

  return { isAuth: true, userId: session.userId }
})

function isValidSession(session: SessionPayload | null): session is SessionPayload {
  if (!session) return false;
  return (
    typeof session.userId === 'number' &&
    session.userId > 0 &&
    new Date(session.expiresAt) > new Date()
  );
}

export const getUser = async (userId: number) => {
    const user = await fetchUser(userId);
    if (!user) {
      redirect('/auth');
    }
    return user;
};