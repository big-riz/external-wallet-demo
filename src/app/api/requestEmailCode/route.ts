import { NextRequest, NextResponse } from 'next/server';
import { WalletService, Environments, HandCashApiError } from '@handcash/handcash-sdk';
import { z } from 'zod';
import crypto from 'crypto';
import { createUser } from '@/lib/db';
import 'dotenv/config';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.local,
});

const inputSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { email } = result.data;

    const randomEmail = `${email.split('@')[0]}+${crypto.randomInt(10000)}@${email.split('@')[1]}`;

    try {
      const requestId = await walletService.requestSignUpEmailCode(randomEmail);
      await createUser(randomEmail);
      
      return NextResponse.json({ email: randomEmail, requestId }, { status: 201 });
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
}