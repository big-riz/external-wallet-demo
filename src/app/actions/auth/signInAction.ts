'use server'

import { z } from 'zod';
import { findUserByEmail } from '@/lib/db';
import { createSession } from '@/lib/session';
import bcrypt from 'bcrypt';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(prevState: any, formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { 
      error: 'Invalid input', 
      errors: validatedFields.error.flatten().fieldErrors 
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: 'Invalid credentials' };
    }

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Failed to sign in' };
  }
}
