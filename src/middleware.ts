import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define public routes
const publicRoutes = ['/auth'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = request.cookies.get('session')?.value;

  let session = null;

  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
