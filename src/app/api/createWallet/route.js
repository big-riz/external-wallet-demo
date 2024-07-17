import { NextResponse } from 'next/server';
import { HandCashConnect, Environments } from '@handcash/handcash-connect';
import crypto from 'crypto';
import 'dotenv/config';

const localEnv = {
    apiEndpoint: 'http://localhost:8000',
    clientUrl: 'http://localhost:8000',
    trustholderEndpoint: Environments.iae.trustholderEndpoint
}
const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET,
  env: Environments.iae,
});

const generateRequest = async (email) => {
  const requestId = await handCashConnect.requestEmailCode(email);
  return requestId;
};

export async function POST(request) {
  const { email } = await request.json();
  // Generate a random email with a unique identifier
  const randomEmail = `${email.split('@')[0]}+${crypto.randomInt(10000)}@${email.split('@')[1]}`;
  const requestId = await generateRequest(randomEmail);

  return NextResponse.json({ email: randomEmail, requestId }, { status: 201 });
}
