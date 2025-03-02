import { HandCashConnect, Environments } from '@handcash/handcash-connect';

const handcashAppId = process.env.HANDCASH_APP_ID as string;
const handcashAppSecret = process.env.HANDCASH_APP_SECRET as string;

export class HandCashService {
  private static instance: HandCashService;
  private handCashConnect: HandCashConnect;

  private constructor() {
    this.handCashConnect = new HandCashConnect({
      appId: handcashAppId,
      appSecret: handcashAppSecret,
      env: Environments.prod,
    });
  }

  public static getInstance(): HandCashService {
    if (!HandCashService.instance) {
      HandCashService.instance = new HandCashService();
    }
    return HandCashService.instance;
  }

  public generateAuthenticationKeyPair() {
    return this.handCashConnect.generateAuthenticationKeyPair();
  }

  public async requestEmailCode(email: string) {
    try {
      const  requestId  = await this.handCashConnect.requestEmailCode(email);
      return { requestId };
    } catch (error: any) {
      console.log('Error requesting email code:', error);
      return { requestId: null, error: error };
      
    }
  }

  public async verifyEmailCode(requestId: string, verificationCode: string, publicKey: string, handle: string) {
    try {
      const result = await this.handCashConnect.verifyEmailCode(requestId, verificationCode, publicKey);
      return result;
    } catch (error) {
      console.error('Error verifying email code:', error);
      throw error;
    }
  }

  public async createNewAccount(publicKey: string, email: string, handle: string) {
    try {
      return await this.handCashConnect.createAccount({ accessPublicKey: publicKey, email, alias: handle });
    } catch (error) {
      console.error('Error creating new account:', error);
      throw error;
    }
  }

  public getAccountFromAuthToken(privateKey: string) {
    return this.handCashConnect.getAccountFromAuthToken(privateKey);
  }
}

export const handCashService = HandCashService.getInstance(); 