import { NextResponse } from 'next/server';
import { Crypto, HandCashApiError } from '@handcash/handcash-sdk';
import { updateUserAuthToken } from '@/lib/db';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { walletService

 } from '@/lib/handcash-client';
const inputSchema = z.object({
  verificationCode: z.string().min(1, 'Verification code is required'),
  requestId: z.string().min(1, 'Request ID is required'),
});

export const POST = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { verificationCode, requestId } = result.data;

    const keyPair = Crypto.generateAuthenticationKeyPair();
    let isNewUser = false;
    try {
      const result = await walletService.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
      isNewUser = result.isNewUser;
    } catch (error) {
      if (error instanceof HandCashApiError) {
        console.error('SDK Error during email verification:', error);
        return NextResponse.json({ message: 'Failed to verify email code', errorCode: 'EMAIL_VERIFICATION_FAILED' }, { status: 400 });
      }
      throw error;
    }
    await updateUserAuthToken(request.user.id, keyPair.privateKey);
    return NextResponse.json({ isNewUser }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}, false, false);