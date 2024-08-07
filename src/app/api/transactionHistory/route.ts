import { NextResponse } from 'next/server';
import { WalletService, Environments } from '@handcash/handcash-sdk';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';

import 'dotenv/config';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.local,
});

export const POST = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const authToken = request.user.authToken as string;
    const account = walletService.getWalletAccountFromAuthToken(authToken);
    const { items } = await account.wallet.getPaymentHistory({ from: 0, to: 100 });

    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ message: 'Failed to fetch transaction history' }, { status: 500 });
  }
}, true, false);