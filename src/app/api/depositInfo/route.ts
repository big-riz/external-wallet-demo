import { NextResponse } from 'next/server';
import { WalletService, Environments, Types } from '@handcash/handcash-sdk';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';

import 'dotenv/config';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.local,
});

export const GET = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const account = walletService.getWalletAccountFromAuthToken(request.user.authToken);
    const depositInfo: Types.DepositInfo = await account.wallet.getDepositInfo();
    return NextResponse.json(depositInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to get Deposit info' }, { status: 500 });
  }
}, true, false);