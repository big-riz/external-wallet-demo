import { NextRequest, NextResponse } from 'next/server';
import { WalletService, Environments, Types } from '@handcash/handcash-sdk';
import 'dotenv/config';

const walletService = new WalletService({
  appId: process.env.HANDCASH_APP_ID as string,
  appSecret: process.env.HANDCASH_APP_SECRET as string,
  env: Environments.iae,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { authToken } = (await request.json()) as { authToken: string };

    const account = walletService.getWalletAccountFromAuthToken(authToken);
    const depositInfo: Types.DepositInfo = await account.wallet.getDepositInfo();

    return NextResponse.json(depositInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to verify app wallet' }, { status: 500 });
  }
}
