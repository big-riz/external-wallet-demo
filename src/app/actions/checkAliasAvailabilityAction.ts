'use server';

import { walletService } from '@/lib/handcash-client';

export async function checkAliasAvailabilityAction(alias: string): Promise<boolean> {
  const isAvailable = await walletService.isAliasAvailable(alias);
  return isAvailable;
}