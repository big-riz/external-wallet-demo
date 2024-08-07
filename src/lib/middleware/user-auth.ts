import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUser, User } from '@/lib/db'


const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export interface AuthenticatedRequest extends NextRequest {
  user: User,
}

interface JwtPayload {
  id: number;
}

function isJwtPayload(decoded: any): decoded is JwtPayload {
  return typeof decoded === 'object' && decoded !== null && typeof decoded.id === 'number';
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  requireWallet = false,
  requireAdmin = false,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided');
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isJwtPayload(decoded)) {
      console.log('Invalid token payload:', decoded);
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const user = await getUser(decoded.id);

    if (!user) {
      console.log('User not found', decoded);
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    request.user = user;

    if(requireWallet && !user.walletId && !user.authToken) {
      return NextResponse.json({ error: 'Wallet not connected' }, { status: 403 });
    }

    if(requireAdmin && !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return handler(request);
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

type RouteHandler = (req: AuthenticatedRequest) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, requireWallet = false, requireAdmin = false): RouteHandler {
  return (req: AuthenticatedRequest) => authMiddleware(req, requireWallet, requireAdmin, handler);
}