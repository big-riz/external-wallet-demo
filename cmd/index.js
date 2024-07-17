#!/usr/bin/env node

require('dotenv').config();
const crypto = require('crypto');
const { Command } = require('commander');
const readline = require('readline');
const { HandCashConnect, Environments } = require('@handcash/handcash-connect');
const localEnv = {
    ...Environments.iae,
    apiEndpoint: 'http://localhost:8000'
}
const handCashConnect = new HandCashConnect({ 
   appId: process.env.HANDCASH_APP_ID,
   appSecret: process.env.HANDCASH_APP_SECRET,
   env: localEnv,
});

const program = new Command();

const generateRequest = async (email) => {
    const requestId = await handCashConnect.requestEmailCode(email);
    return requestId;
}

const verifyCode = async (verificationCode, requestId) => {
    const keyPair = handCashConnect.generateAuthenticationKeyPair();
    await handCashConnect.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
    return keyPair;
}

const promptUserInput = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

program
    .command('createACW [email]')
    .description('Create and verify a new app created wallet account')
    .action(async (email) => {
        email = email || 'brandon.bryant002@gmail.com';
        const randomEmail = `${email.split('@')[0]}+${crypto.randomInt(10000)}@${email.split('@')[1]}`;
        const requestId = await generateRequest(randomEmail);
        console.log(`Request ID: ${requestId}`);
        console.log(`Email: ${randomEmail}`);
        
        const code = await promptUserInput('Enter the verification code: ');

        const keyPair = await verifyCode(code, requestId);
        await handCashConnect.createNewAccount(keyPair.publicKey, randomEmail);
        const authToken = keyPair.privateKey;
        const cloudAccount = handCashConnect.getAccountFromAuthToken(authToken);
        const profile = await cloudAccount.profile.getCurrentProfile();
        console.log({
            accessToken: authToken,
            profile
        });
    });

program
    .command('createExternal [email]')
    .description('Create and verify a new app created wallet account')
    .action(async (email) => {
        email = email || 'brandon.bryant002@gmail.com';
        const randomEmail = `${email.split('@')[0]}+${crypto.randomInt(10000)}@${email.split('@')[1]}`;
        const requestId = await generateRequest(randomEmail);
        
        const code = await promptUserInput('Enter the verification code: ');

        const keyPair = await verifyCode(code, requestId);

        
        const alias = randomEmail.split('@')[0];
        await handCashConnect.createNewExternalAccount(keyPair.publicKey, randomEmail, alias);
        const authToken = keyPair.privateKey;
        const cloudAccount = handCashConnect.getAccountFromAuthToken(authToken);
        const profile = await cloudAccount.profile.getCurrentProfile();
        console.log({
            accessToken: authToken,
            profile
        });
    });


program.parse(process.argv);
