import { NextRequest, NextResponse } from 'next/server';
import { WalletService, Environments, HandCashApiError } from '@handcash/handcash-sdk';
import { z } from 'zod';
import 'dotenv/config';
import { walletService } from '@/lib/handcash-client';

const inputSchema = z.object({
  alias: z.string().min(1, 'Alias is required'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const result = inputSchema.safeParse(body);
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json({ message: 'Invalid input', details: errorMessages }, { status: 400 });
    }

    const { alias } = result.data;

    try {
      const isAvailable = await walletService.isAliasAvailable(alias);
      return NextResponse.json({ isAvailable }, { status: 200 });
    } catch (error: any) {
      if (error instanceof HandCashApiError) {
        console.error('SDK Error during alias availability check:', error);
        return NextResponse.json({ message: 'Failed to check alias availability', errorCode: 'ALIAS_CHECK_FAILED' }, { status: 400 });
      }
      throw error;
    }
  } catch (error: any) {
    if (error.message === 'Invalid alias. The alias must be between 4 and 50 characters long and can only contain letters, numbers, hyphens, underscores, and periods.') {
      return NextResponse.json({ message: error.message, errorCode: 'ALIAS_INVALID' }, { status: 400 });
    }
    console.error('Unexpected error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', errorCode: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}