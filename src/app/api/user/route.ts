import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { getAccountFromAuthToken } from '@/lib/handcash-client';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  console.log(req.user);

  const result = {
    email: req.user.email,
    id: req.user.id,
    hasToken: !!req.user.authToken,
    walletId: req.user!.walletId,
    isAdmin: req.user.isAdmin,

  };
  if (req.user.authToken) {
    const account = getAccountFromAuthToken(req.user.authToken);
    const [depositInfo, balances] = await Promise.all([account.wallet.getDepositInfo(), account.wallet.getTotalBalance()]);
    result.depositInfo = depositInfo || {}
    result.balances = balances.items || [];
    console.log(result);
  }
  return NextResponse.json(result, { status: 200 });
}, false, false);