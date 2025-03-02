'use server'

import { z } from 'zod';
import { createUser, findUserByEmail } from '@/lib/db';

import { createSession } from '@/lib/session';

const FormSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function signUpAction(formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data;
  
  try {
    await createUser(email);
    const user = await findUserByEmail(email);

    if (!user) {
      return { error: 'Failed to create user' };
    }
    //await createSession(user.id, null)
    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: 'Failed to create account' };
  }
}