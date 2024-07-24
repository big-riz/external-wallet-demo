import { NextRequest, NextResponse } from 'next/server';
import { getUser, clearAuthToken } from '@/lib/db';
import { isAdmin } from '@/lib/auth';




export async function DELETE(request: NextRequest, { params }: { params: { email: string } }): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await clearAuthToken(params.email);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'An error occurred while deleting the user' }, { status: 500 });
  }
}
export async function GET(request: NextRequest, { params }: { params: { email: string } }): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getUser(params.email);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'An error occurred while fetching the user' }, { status: 500 });
  }
}