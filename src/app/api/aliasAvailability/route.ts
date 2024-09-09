import { NextRequest, NextResponse } from 'next/server';
import { HandCashApiError } from '@handcash/handcash-sdk';
import { z } from 'zod';
import { walletService } from '@/lib/handcash-client';

// Input validation schema
const inputSchema = z.object({
  alias: z.string().min(1, 'Alias is required'),
});

// Error response helper function
const createErrorResponse = (message: string, errorCode: string, status: number) => {
  return NextResponse.json({ message, errorCode }, { status });
};

// Validate input
const validateInput = (body: any) => {
  const result = inputSchema.safeParse(body);
  if (!result.success) {
    const errorMessages = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new Error(errorMessages);
  }
  return result.data;
};

// Check alias availability
const checkAliasAvailability = async (alias: string) => {
  try {
    return await walletService.isAliasAvailable(alias);
  } catch (error) {
    if (error instanceof HandCashApiError) {
      console.error('SDK Error during alias availability check:', error);
      throw new Error('Failed to check alias availability');
    }
    throw error;
  }
};

// Main handler function
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const { alias } = validateInput(body);

    // Check alias availability
    const isAvailable = await checkAliasAvailability(alias);

    return NextResponse.json({ isAvailable }, { status: 200 });
  } catch (error: any) {
    // Handle known errors
    if (error.message.includes('Invalid alias')) {
      return createErrorResponse(error.message, 'ALIAS_INVALID', 400);
    }
    if (error.message === 'Failed to check alias availability') {
      return createErrorResponse(error.message, 'ALIAS_CHECK_FAILED', 400);
    }
    if (error.message.includes('Alias is required')) {
      return createErrorResponse('Invalid input', error.message, 400);
    }
    
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return createErrorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}
