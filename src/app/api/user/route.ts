import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { mapUser } from '@/lib/middleware/user-auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  return NextResponse.json(mapUser(req.user), { status: 200 });
}, false, false);