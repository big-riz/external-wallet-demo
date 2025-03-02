'use server';

import { handCashService } from '@/lib/handcash/handcash-connect';
import { updateUserAuthToken, updateUserHandle } from '@/lib/db';
import { z } from 'zod';
import { verifySession, getUser } from '@/lib/dal';

const inputSchema = z.object({
  verificationCode: z.string().min(1, 'Verification code is required'),
  requestId: z.string().min(1, 'Request ID is required'),
  email: z.string().email('Valid email is required'),
  handle: z.string().min(1, 'Handle is required')
});

export async function verifyEmailCodeAction(formData: FormData) {
  try {
    const result = inputSchema.safeParse({
      verificationCode: formData.get('verificationCode'),
      requestId: formData.get('requestId'),
      email: formData.get('email'),
      handle: formData.get('handle')
    });

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Invalid input: ${errorMessages}`);
    }

    const { verificationCode, requestId, email, handle } = result.data;

    const keyPair = handCashService.generateAuthenticationKeyPair();

    try {
      // Verify email code
      const verifyResult = await handCashService.verifyEmailCode(
        requestId, 
        verificationCode, 
        keyPair.publicKey,
        handle
      );

      // Create new account if verification successful
      const profile = await handCashService.createNewAccount(
        keyPair.publicKey,
        email,
        handle
      );

      // Get the session and user
      const session = await verifySession();
      if (!session.isAuth || !session.userId) {
        return {
          success: false,
          error: 'User not authenticated',
          redirect: "https://app.handcash.io/#/authorizeApp?appId=" + process.env.HANDCASH_APP_ID
        };
      }
      const user = await getUser(session.userId);
      if (!user) {
        return {
          success: false,  
          error: 'User not found',
          redirect: "https://app.handcash.io/#/authorizeApp?appId=" + process.env.HANDCASH_APP_ID
        };
      }

      await updateUserAuthToken(user.id, keyPair.privateKey);
      await updateUserHandle(user.id, handle);

      return { 
        success: true, 
        isNewUser: verifyResult.isNewUser 
      };
    } catch (error) {
      console.error('HandCash operation failed:', error);
      throw new Error('Failed to complete wallet setup');
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}
