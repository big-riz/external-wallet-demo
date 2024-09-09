import { WalletService, Environments, Types } from '@handcash/handcash-sdk'
import { insertOrUpdateDepositInfo, insertOrUpdateUserBalances, getUser } from './db';

export const walletService = new WalletService({
    appId: process.env.HANDCASH_APP_ID as string,
    appSecret: process.env.HANDCASH_APP_SECRET as string,
    env: Environments.iae,
    
});
  
export const getAccountFromAuthToken = (authToken: string) => {
    return walletService.getWalletAccountFromAuthToken(authToken);
}


export async function refreshWalletInfo(userId: number, authToken: string) {
    const account = getAccountFromAuthToken(authToken);
    const depositInfo: Types.DepositInfo = await account.wallet.getDepositInfo();
    const balances: Types.Many<Types.UserBalance> = await account.wallet.getTotalBalance();
    await insertOrUpdateDepositInfo(userId, depositInfo);
    await insertOrUpdateUserBalances(userId, balances.items);
  
    return getUser(userId)
  }