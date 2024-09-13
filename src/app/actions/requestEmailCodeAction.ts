'use server';

import { requestSignUpEmailCode } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal';

export async function requestEmailCodeAction() {
  const session = await verifySession();
  const user = await getUser(session.userId);

  const requestId = await requestSignUpEmailCode(user.email);
  return { email: user.email, requestId };
}
