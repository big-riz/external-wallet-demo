import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { getAccountFromAuthToken } from '@/lib/handcash-client';



export const GET = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
  try {
    const account = getAccountFromAuthToken(request.user.authToken as string);
    const depositInfo: Types.DepositInfo = await account.wallet.getDepositInfo();
    return NextResponse.json(depositInfo, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to get Deposit info' }, { status: 500 });
  }
}, true, false);