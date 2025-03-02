import { WalletService, Environments } from '@handcash/handcash-sdk'

export const walletService = new WalletService({
    appId: process.env.HANDCASH_APP_ID as string,
    appSecret: process.env.HANDCASH_APP_SECRET as string,
    env: Environments.prod,
    
});
  
const getAccountFromAuthToken = (authToken: string) => {
    return walletService.getWalletAccountFromAuthToken(authToken);
}

export const getDepositInfo = (authToken: string) => {
    return getAccountFromAuthToken(authToken).wallet.getDepositInfo();;
}

export async function pay(authToken: string, destination: string, amount: number) {
    const account = getAccountFromAuthToken(authToken);
    const paymentResult = await account.wallet.pay({
        currencyCode: 'BSV',
        denominatedIn: 'USD',
        receivers: [{
            destination,
            amount,
        }]
    });
    return paymentResult;
}

export async function getTransactionHistory(authToken: string) {
    const account = getAccountFromAuthToken(authToken);
    const { items } = await account.wallet.getPaymentHistory({ from: 0, to: 100 });
    return items;
}
    
export async function requestSignUpEmailCode(email: string, html: string) {
    try {
        console.log('Requesting email code for:', email);
        console.log('Using APP_ID:', process.env.HANDCASH_APP_ID);
        // Don't log the full secret, just a portion to verify it's present
        console.log('APP_SECRET present:', !!process.env.HANDCASH_APP_SECRET);
        
        // Make a real API call regardless of environment
        return await walletService.requestSignUpEmailCode(email, { html });
    } catch (error) {
        console.error('Error in requestSignUpEmailCode:', error);
        throw error;
    }
}

export async function verifyEmailCode(requestId: string, code: string, accessPublicKey: string) {
    return walletService.verifyEmailCode(requestId, code, accessPublicKey);
}

export async function getBalances(accessToken: string) {
    const account = getAccountFromAuthToken(accessToken);
    return account.wallet.getTotalBalance();
}

export async function createPaymentRequest(destination: string, amount: number, redirectUrl: string | undefined) {
    const result = await fetch('https://iae.cloud.handcash.io/v3/paymentRequests', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'App-Id': process.env.HANDCASH_APP_ID as string,
            'App-Secret': process.env.HANDCASH_APP_SECRET as string,
        },
        body: JSON.stringify({
            receivers: [{
                destination,
                amount,
            }],
            product: {
                name: 'Deposit into Casino',
            },
            currencyCode: 'BSV',
            denominatedIn: 'USD',
            expirationType: 'never',
            redirectUrl,
        }),
    });
    const res = (await result.json());
    return res.paymentRequestUrl as string;
}