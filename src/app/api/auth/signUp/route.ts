// src/app/api/auth/signUp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createUser, findUserByPassword } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    // Create new user with hashed password
    await createUser(email, password);

    // Find the newly created user
    const user = await findUserByPassword(email, password);

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}