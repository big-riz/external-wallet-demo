import { NextResponse } from 'next/server';
import { WalletService, Environments, HandCashApiError } from '@handcash/handcash-sdk';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.local,
});


export const POST = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const { email } = request.user;
    try {
      const requestId = await walletService.requestSignUpEmailCode(email);
      return NextResponse.json({ email: email, requestId }, { status: 201 });
    } catch (error) {
      if (error instanceof HandCashApiError) {
        console.error('SDK Error during email code request:', error);
        return NextResponse.json({ message: 'Failed to request email code', errorCode: 'EMAIL_CODE_REQUEST_FAILED' }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}, false, false);