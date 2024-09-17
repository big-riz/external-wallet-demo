'use server'

import { createPaymentRequest } from '@/lib/handcash-client';
import { verifySession, getUser } from '@/lib/dal'
import { getDepositInfo } from '@/lib/handcash-client';

export async function CreatePaymentRequest() {
  try {
    const session = await verifySession()
    const user = await getUser(session.userId);
    if(!user || !user.authToken) {
        return { error: 'User not found' };
    }
    const depositInfo = await getDepositInfo(user.authToken);
    return createPaymentRequest(depositInfo.id, 1);
  } catch (error: any) {
    console.error('Payment error:', error.message);
    return { error: error.message || 'Failed to process payment' };
  }
}