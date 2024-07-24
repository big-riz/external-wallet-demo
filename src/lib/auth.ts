import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded as any).role === 'admin';
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return false;
  }
}