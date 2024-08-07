// src/app/api/auth/signIn/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { findUserByPassword } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    // Find user by email and hashed password
    const user = await findUserByPassword(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}