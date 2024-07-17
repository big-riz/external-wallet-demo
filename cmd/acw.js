#!/usr/bin/env node

require('dotenv').config();
const crypto = require('crypto');
const { Command } = require('commander');
const readline = require('readline');
const { HandCashConnect, Environments } = require('@handcash/handcash-connect');
const handCashConnect = new HandCashConnect({ 
   appId: process.env.HANDCASH_APP_ID,
   appSecret: process.env.HANDCASH_APP_SECRET,
   env: Environments.iae
});

const program = new Command();

const generateRequest = async (email) => {
    const requestId = await handCashConnect.requestEmailCode(email);
    return requestId;
}

const verifyCode = async (email, verificationCode, requestId) => {
    const keyPair = handCashConnect.generateAuthenticationKeyPair();
    await handCashConnect.verifyEmailCode(requestId, verificationCode, keyPair.publicKey);
    const publicProfile = await handCashConnect.createNewAccount(keyPair.publicKey, email);
    return {
        authToken: keyPair.privateKey,
        publicProfile,
    };
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
    .command('create [email]')
    .description('Create and verify a new account with an optional email parameter')
    .action(async (email) => {
        email = email || 'brandon.bryant002@gmail.com';
        const randomEmail = `${email.split('@')[0]}+${crypto.randomInt(10000)}@${email.split('@')[1]}`;
        const requestId = await generateRequest(randomEmail);
        console.log(`Request ID: ${requestId}`);
        console.log(`Email: ${randomEmail}`);
        
        const code = await promptUserInput('Enter the verification code: ');

        const { authToken, publicProfile } = await verifyCode(randomEmail, code, requestId);
        const cloudAccount = handCashConnect.getAccountFromAuthToken(authToken);
        const profile = await cloudAccount.profile.getCurrentProfile();
        console.log({
            accessToken: authToken,
            profile
        });
    });

program.parse(process.argv);
