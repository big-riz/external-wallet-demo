// src/lib/session.ts
'use server';

import { SignJWT, jwtVerify } from 'jose';
import { SessionPayload } from '@/lib/definitions';
import { cookies } from 'next/headers';

// Make sure we have a session secret, fall back to a default for development only
const secretKey = process.env.SESSION_SECRET || 'development_fallback_secret_key_do_not_use_in_production';
if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not defined in environment variables. Using insecure fallback for development.');
}
const encodedKey = new TextEncoder().encode(secretKey);



export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session || '', encodedKey, {
      algorithms: ['HS256'],
    });
    const sessionPayload = payload as SessionPayload;

    // Check if the session has expired
    if (sessionPayload.expiresAt && new Date(sessionPayload.expiresAt) < new Date()) {
      console.log('Session has expired');
      return null;
    }

    return sessionPayload;
  } catch (error) {
    console.log(error, 'Failed to verify session');
    return null;
  }
}

export async function createSession(userId: number, publicProfile: any) {
  console.log(publicProfile, 'publicProfile');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days
  const session = await encrypt({ userId, profile: publicProfile?publicProfile:null, expiresAt: expiresAt.toISOString() });

  const handle = publicProfile.publicProfile.handle;
  cookies().set('handle', handle, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export async function updateSession() {
  const currentSession = cookies().get('session')?.value;

  const payload = await decrypt(currentSession);

  if (!currentSession || !payload) {
    return null;
  }


  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newPayload: SessionPayload = {
    ...payload,
    expiresAt: newExpiresAt.toISOString(),
  };

  const newSession = await encrypt(newPayload);



  cookies().set('session', newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',

    sameSite: 'lax',
    path: '/',
  });

  return newPayload;
}

export async function deleteSession() {
  cookies().delete('session');
}
