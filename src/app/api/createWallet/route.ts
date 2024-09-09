import { NextResponse } from 'next/server';
import { Crypto, HandCashApiError } from '@handcash/handcash-sdk';
import { updateUserWalletCreated, clearAuthToken } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { z } from 'zod';
import { walletService } from '@/lib/handcash-client';

const inputSchema = z.object({
  alias: z.string().min(1, 'Alias is required'),
});

export const POST = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { alias } = result.data;


    try {

      if(request.user.walletId) {
        return NextResponse.json({ message: 'Wallet already created', errorCode: 'WALLET_ALREADY_CREATED' }, { status: 400 });
      }
      const publicKey = Crypto.getPublicKeyFromPrivateKey(request.user.authToken as string);
      const depositInfo = await walletService.createWalletAccount(publicKey, request.user.email, alias);
      await updateUserWalletCreated(request.user.id, depositInfo.id);
      return NextResponse.json(depositInfo, { status: 200 });
    } catch (error) {
      if (error instanceof HandCashApiError) {
        if(error.message === "An account with this email already exists. Redirect the user to authorize your app instead") {
          await clearAuthToken(request.user.id);
        }
        console.error('SDK Error during wallet creation:', error.message);
        return NextResponse.json({ message: 'Failed to create wallet account', errorCode: 'WALLET_CREATION_FAILED' }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}, false, false);