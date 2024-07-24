import { NextRequest, NextResponse } from 'next/server';
import { WalletService, Environments, Crypto, HandCashApiError } from '@handcash/handcash-sdk';
import { updateUserAuthToken } from '@/lib/db';
import { z } from 'zod';
import 'dotenv/config';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.local,
});

const inputSchema = z.object({
  email: z.string().email('Invalid email format'),
  verificationCode: z.string().min(1, 'Verification code is required'),
  requestId: z.string().min(1, 'Request ID is required'),
  alias: z.string().min(1, 'Alias is required'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { email, verificationCode, requestId, alias } = result.data;

    const keyPair = Crypto.generateAuthenticationKeyPair();

    try {
      await walletService.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
    } catch (error) {
      if (error instanceof HandCashApiError) {
        console.error('SDK Error during email verification:', error);
        return NextResponse.json({ message: 'Failed to verify email code', errorCode: 'EMAIL_VERIFICATION_FAILED' }, { status: 400 });
      }
      throw error;
    }

    try {
      await walletService.createWalletAccount(keyPair.publicKey, email, alias);
      await updateUserAuthToken(email, keyPair.privateKey);
    } catch (error) {
      if (error instanceof HandCashApiError) {
        console.error('SDK Error during wallet creation:', error);
        return NextResponse.json({ message: 'Failed to create wallet account', errorCode: 'WALLET_CREATION_FAILED' }, { status: 400 });
      }
      throw error;
    }

    // Return the private key as the authToken
    return NextResponse.json({ authToken: keyPair.privateKey }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}