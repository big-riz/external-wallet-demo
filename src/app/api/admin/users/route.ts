import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { getUsers, User } from '@/lib/db';
import { mapUser } from '@/lib/middleware/user-auth';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const users = await getUsers();
    const result = users.map((user: User) => mapUser(user));

  return NextResponse.json(result, { status: 200 });
}, false, false);