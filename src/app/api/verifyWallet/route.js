import { NextResponse } from 'next/server';
import { HandCashConnect, Environments } from '@handcash/handcash-connect';
import 'dotenv/config';

const localEnv = {
  ...Environments.iae,
  apiEndpoint: 'http://localhost:8000',
}
const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET,
  env: localEnv,
});

const verifyCode = async (email, verificationCode, requestId, alias) => {
  const keyPair = handCashConnect.generateAuthenticationKeyPair();
  await handCashConnect.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
  let publicProfile;
  if (!alias || alias === '') {
    publicProfile = await handCashConnect.createNewAccount(keyPair.publicKey, email, alias);
  } else {
    publicProfile = await handCashConnect.createNewExternalAccount(keyPair.publicKey, email, alias);
  }
  return {
    authToken: keyPair.privateKey,
    publicProfile,
  };
};

export async function POST(request) {
  const { email, verificationCode, requestId, alias } = await request.json();

  try {
    const { authToken, publicProfile } = await verifyCode(email, verificationCode, requestId, alias);
    return NextResponse.json({ authToken, publicProfile }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to verify app wallet' }, { status: 500 });
  }
}
