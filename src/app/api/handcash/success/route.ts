import { NextRequest, NextResponse } from 'next/server';
import { handCashService } from '@/lib/handcash/handcash-connect';
import { createSession } from '@/lib/session';
import { updateUserAuthToken, createUser, findUserByEmail, updateUserHandle } from '@/lib/db';
import { getUser, verifySession } from '@/lib/dal';
import { z } from 'zod';

const querySchema = z.object({
  authToken: z.string().min(1, 'Auth token is required'),
});

export async function GET(request: NextRequest) {
  try {
    // Get the authToken from query parameters
    const searchParams = request.nextUrl.searchParams;
    const result = querySchema.safeParse({
      authToken: searchParams.get('authToken'),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 400 }
      );
    }

    const { authToken } = result.data;


    try {
      // Verify the auth token by attempting to get the account
      const account = handCashService.getAccountFromAuthToken(authToken);
      if (!account) {
        throw new Error('Invalid HandCash auth token');
      }
     console.log(account);

      const pp = await account.profile.getCurrentProfile();

     const user = await findUserByEmail(pp.privateProfile.email);
     if (!user) {
      const user1 = await createUser(pp.privateProfile.email);
      const user2 = await findUserByEmail(pp.privateProfile.email);
      if (!user2) {
        throw new Error('Failed to create user');
      }
      await updateUserAuthToken(user2.id, authToken);

      // Create a new session with the updated user data
      await createSession(user2.id, pp);
     }else{
        await updateUserAuthToken(user.id, authToken);
        
        // Create a new session with the updated user data
        await createSession(user.id, pp);
     }


      // Redirect to the WebGL page
      return NextResponse.redirect(new URL('/webgl', request.url));
    } catch (error) {
      console.error('HandCash authentication error:', error);
      return NextResponse.json(
        { error: 'Failed to authenticate with HandCash' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}