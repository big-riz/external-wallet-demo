import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/user-auth';
import { walletService } from '@/lib/handcash-client';
import { z } from 'zod';

const inputSchema = z.object({
    destination: z.string().min(1, 'wallet id is required'),
    amount: z.number().min(0.01, 'amount is required'),
});
  


export const POST = withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const result = inputSchema.safeParse(body);
  
      if (!result.success) {
        return NextResponse.json({ message: 'Invalid input', errors: result.error.errors }, { status: 400 });
      }
  
      const { destination, amount } = result.data;
  
      const authToken = request.user.authToken as string;
      const account = walletService.getWalletAccountFromAuthToken(authToken);
      
      const paymentResult = await account.wallet.pay({
        currencyCode: 'BSV',
        denominatedIn: 'USD',
        receivers: [{
          destination,
          amount: amount,
        }]
      });
  
      return NextResponse.json(paymentResult, { status: 200 });
    } catch (error: any) {
      console.error(error.message);
      return NextResponse.json({ message: 'Failed to process payment' }, { status: 500 });
    }
  }, true, false);