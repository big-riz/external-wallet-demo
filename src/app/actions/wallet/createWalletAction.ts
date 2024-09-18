'use server';

import { verifySession, getUser } from '@/lib/dal';
import { walletService } from '@/lib/handcash-client';
import { updateUserWalletCreated, updateUserAuthToken } from '@/lib/db';
import { Crypto } from '@handcash/handcash-sdk';

interface CreateWalletInput {
  alias: string;
  verificationCode: string;
  requestId: string;
}

export async function createWalletAction(input: CreateWalletInput) {
  const { alias, verificationCode, requestId } = input;

  // Verify session and get user
  const session = await verifySession();
  const user = await getUser(session.userId);

  // Generate key pair
  const keyPair = Crypto.generateAuthenticationKeyPair();

  // Verify email code
  await walletService.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);

  // Save private key as authToken
  await updateUserAuthToken(user.id, keyPair.privateKey);

  // Create wallet account
  const { id: walletId } = await walletService.createWalletAccount(
    keyPair.publicKey,
    user.email,
    alias
  );

  // Update user with walletId
  await updateUserWalletCreated(user.id, walletId);

  return { success: true };
}
