'use server'

import { z } from 'zod';
import { pay } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'

const inputSchema = z.object({
  destination: z.string().min(1, 'wallet id is required'),
  amount: z.number().min(0.01, 'amount is required'),
});

export async function makePayment(formData: FormData) {
  try {
    const session = await verifySession()
    const user = await getUser(session.userId);
    const destination = formData.get('destination') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const result = inputSchema.safeParse({ destination, amount });
    if (!result.success) {
      return { error: 'Invalid input', details: result.error.errors };
    }
    if (!user.authToken) {
      return { error: 'User needs to verify email' };
    }
    const paymentResult = await pay(user.authToken, destination, amount);
    return { success: true, data: paymentResult };
  } catch (error: any) {
    console.error('Payment error:', error.message);
    return { error: error.message || 'Failed to process payment' };
  }
}