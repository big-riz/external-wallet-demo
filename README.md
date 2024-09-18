
# Handcash Wallet Creation Demo

## Overview

This is a Next.js-based application that demonstrates how to integrate the Handcash Wallet Service into an iGaming platform. It enables users to create a BSV (Bitcoin SV) wallet by verifying their email, allowing seamless money transfers within the app, such as for online games like "Heads or Tails."

The primary focus is on simplifying wallet integration and transaction handling, making it ideal for gaming platforms where users can deposit and withdraw funds securely.

## Features

- **Email-Based Wallet Creation**: Users can create a Bitcoin SV wallet by verifying their email.
- **Seamless Deposits & Withdrawals**: Supports wallet top-ups using cryptocurrency or credit cards and allows withdrawals via Handcash.
- **Integrated Casino Game**: A "Heads or Tails" game where users can wager using BSV from their wallets.
- **Real-Time Balance Display**: Users can view their wallet balance, and it refreshes automatically.
- **Transaction History**: Users can see their transaction history, with real-time updates on wins and payouts.

## Purpose

This application showcases how a simple casino game can integrate with the Handcash Wallet Service to allow users to make deposits, place bets, and view their balance using Bitcoin SV.

## Technical Stack

- **Frontend**: Next.js (React)
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (via Drizzle ORM)
- **Wallet Service**: Handcash SDK

## Getting Started

1. **Create a Handcash Application**: 
   - Go to [Handcash Dashboard](https://dashboard.handcash.io) and create an application. This wallet will serve as your business’s wallet for managing payouts and receiving profits.

2. **Clone the repository**:
   ```bash
   git clone https://github.com/HandCash/external-wallet-demo.git
   cd external-wallet-demo
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Migrate the database**:
   ```bash
   npx drizzle-kit migrate
   ```

5. **Set up environment variables**:
   Create a `.env` file in the root directory and configure your Handcash API credentials and other settings:
   ```bash
   HANDCASH_APP_ID=your_app_id
   HANDCASH_APP_SECRET=your_app_secret
   SESSION_SECRET=secret
   NEXT_PUBLIC_APP_NAME=OnChainCasino
   DOMAIN=""
   DATABASE_URL=postgres://docker:docker@0.0.0.0:5432/docker
   BUSINESS_WALLET_ID=""
   BUSINESS_WALLET_AUTH_TOKEN=""
   NEXT_PUBLIC_GUARDARIAN_API_TOKEN=""
   NEXT_PUBLIC_NEXT_EXCHANGE_AFFILIATE_ID=""
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Key Components

- **User Registration**: Users sign up via email, with email verification to create a wallet.
- **Wallet Creation**: Handcash API integration to create BSV wallets for users.
- **Transaction Management**: Users can send and receive BSV within the app using Handcash wallets.
- **Deposit System**: Supports top-ups using cryptocurrencies or credit cards via third-party services.
- **Casino Game**: A "Heads or Tails" game where users can place bets with their BSV balance.
- **Balance Display**: Real-time wallet balance updates using the WalletContext.
- **History of Transactions**: Displays user transactions, including bets and payments.

## Wallet Creation Process

The wallet creation process is handled through the following steps:

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Handcash

    User->>App: Sign up request
    App-->>User: Confirmation

    User->>App: Request wallet creation
    App->>Handcash: Request email verification
    Handcash->>User: Sends verification email
    Handcash-->>App: Responds with request_id

    User->>App: Enters verification code
    App->>Handcash: Verify code with request_id
    Handcash-->>App: Email verified

    App->>User: Alias selection
    User->>App: Submit alias
    App->>Handcash: Check alias availability
    Handcash-->>App: Alias available
    App->>Handcash: Create wallet
    Handcash-->>App: Wallet created
    App-->>User: Wallet created, show deposit options
```

## Handcash Client and Wallet Context

The [Handcash client](src/lib/handcash-client.ts) contains all the methods required to interact with the Handcash Wallet Service, including wallet creation, balance fetching, and transaction management.

Server-side actions for wallet-related tasks are located in [src/app/actions/wallet/](src/app/actions/wallet/) and are used to interact with the Handcash API.

The [`WalletContext`](src/app/context/WalletContext.tsx) is provided to manage the user's wallet state and can be used within components to fetch balances, refresh them, and handle wallet-related operations seamlessly.
