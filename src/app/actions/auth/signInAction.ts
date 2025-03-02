'use server'

import { z } from 'zod';
import { findUserByEmail, updateUserHandle } from '@/lib/db';
import { createSession } from '@/lib/session';

import { handCashService } from '@/lib/handcash/handcash-connect';

const FormSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function signIn(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { error: 'User not found' };
    }

    const publicProfile = await handCashService.getAccountFromAuthToken(user.authToken as string);
    const pp = await publicProfile.profile.getCurrentProfile();
    if (!publicProfile || !pp) {
      return { error: 'Failed to get public profile' };
    }
    await createSession(user.id, pp);
    await updateUserHandle(user.id, pp.publicProfile.handle);
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Failed to sign in' };
  }
}
