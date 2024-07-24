import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const inputSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pw';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { password } = result.data;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}