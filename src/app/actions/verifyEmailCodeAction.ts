'use server';

import { verifyEmailCode } from '@/lib/handcash-client';
import { HandCashApiError, Crypto } from '@handcash/handcash-sdk';
import { updateUserAuthToken } from '@/lib/db';
import { z } from 'zod';
import { verifySession, getUser } from '@/lib/dal';

const inputSchema = z.object({
  verificationCode: z.string().min(1, 'Verification code is required'),
  requestId: z.string().min(1, 'Request ID is required'),
});

export async function verifyEmailCodeAction(formData: FormData) {
  try {
    const result = inputSchema.safeParse({
      verificationCode: formData.get('verificationCode'),
      requestId: formData.get('requestId'),
    });
    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Invalid input: ${errorMessages}`);
    }

    const { verificationCode, requestId } = result.data;

    const session = await verifySession()
    const user = await getUser(session.userId);;

    const keyPair = Crypto.generateAuthenticationKeyPair();
    let isNewUser = false;

    try {
      const result = await verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
      isNewUser = result.isNewUser;
    } catch (error) {
      if (error instanceof HandCashApiError) {
        throw new Error('Failed to verify email code');
      }
      throw error;
    }

    await updateUserAuthToken(user.id, keyPair.privateKey);

    return { isNewUser };
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}
