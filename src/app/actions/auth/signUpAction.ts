'use server'

import { z } from 'zod';
import { createUser, findUserByEmail } from '@/lib/db';
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/session';

const SignupFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(1)
    .trim(),
})
 

export async function signUp(prevState: any, formData: FormData) {
    const validatedFields = SignupFormSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
  if (!validatedFields.success) {
    return { 
      error: 'Invalid input', 
      errors: validatedFields.error.flatten().fieldErrors 
    };
  }

  const { email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await createUser(email, hashedPassword);
    const user = await findUserByEmail(email);

    if (!user) {
      return { error: 'Failed to create user' };
    }
    await createSession(user.id)
    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'Failed to create account' };
  }
}