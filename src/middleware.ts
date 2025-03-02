import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Public paths that don't require authentication
const publicPaths = ['/auth', '/api/auth', '/webgl', '/api/handcash/success'];

export async function middleware(request: NextRequest) {
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;

  let session = null;

  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  if (!session?.userId) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
