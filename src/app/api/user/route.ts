import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  console.log(req.user);
  return NextResponse.json({
    email: req.user.email,
    id: req.user.id,
    hasToken: !!req.user.authToken,
    walletId: req.user!.walletId,
    isAdmin: req.user.isAdmin,

  });
}, false, false);