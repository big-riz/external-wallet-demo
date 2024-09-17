'use server';

import { walletService } from '@/lib/handcash-client';
import { withLogging } from '@/app/actions/logger';

export const checkAliasAvailabilityAction = withLogging('checkAliasAvailability', async (alias: string) => {
  const isAvailable = await walletService.isAliasAvailable(alias);
  return isAvailable;
});