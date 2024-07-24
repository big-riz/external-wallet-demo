import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An error occurred while fetching users' }, { status: 500 });
  }
}