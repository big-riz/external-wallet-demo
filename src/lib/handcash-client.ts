import { WalletService, Environments, Types } from '@handcash/handcash-sdk';

export const walletService = new WalletService({
    appId: process.env.HANDCASH_APP_ID as string,
    appSecret: process.env.HANDCASH_APP_SECRET as string,
    env: Environments.local,
});
  
export const getAccountFromAuthToken = (authToken: string) => {
    return walletService.getWalletAccountFromAuthToken(authToken);
}

