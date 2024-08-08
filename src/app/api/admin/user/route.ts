import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { getAccountFromAuthToken } from '@/lib/handcash-client';
import { getUser } from '@/lib/db';
import { mapUser } from '@/lib/middleware/user-auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  console.log(req.user);
  const { id } = req.json()
  const user = await getUser(id);
  const result = mapUser(user);
  if(user.authToken) {
    const account = getAccountFromAuthToken(user.authToken);
    const [depositInfo, balances] = await Promise.all([account.wallet.getDepositInfo(), account.wallet.getTotalBalance()]);
    result.depositInfo = depositInfo || {}
    result.balances = balances.items || [];
  }
  
  return NextResponse.json(result, { status: 200 });
}, false, false);