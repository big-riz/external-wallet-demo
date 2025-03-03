'use server';

import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db';
import { coinFlipGames, coinFlipStats } from '@/lib/schema';
import { verifySession, getUser } from '@/lib/dal';
import { eq, isNull } from 'drizzle-orm';
import { pay } from '@/lib/handcash-client';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const businessWalletId = process.env.BUSINESS_WALLET_ID as string
const businessWalletAuthToken = process.env.BUSINESS_WALLET_AUTH_TOKEN as string;

export async function createNewGame() {
  const session = await verifySession();
  const userId = session.userId;

  const randomSeedBuffer = randomBytes(8);
  const randomSeed = randomSeedBuffer.toString('hex');
 
  const randomSeedHash = createHash('sha256').update(randomSeed).digest('hex');

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  if (userId === null) {
    throw new Error("User ID is required to create a coin flip game");
  }
  const [game] = await db
    .insert(coinFlipGames)
    .values({
      randomSeed,
      playerId: userId,
      expiresAt,
    })
    .returning({ id: coinFlipGames.id })
    .execute();

  return {
    gameId: game.id,
    randomSeedHash,
  };
}

export async function makeBet(formData: FormData) {
  try {
    const gameId = parseInt(formData.get('gameId') as string);
    const wagerAmount = parseFloat(formData.get('wagerAmount') as string);
    const playerSelection = formData.get('playerSelection') as 'Heads' | 'Tails';

    const session = await verifySession();
    if (!session.userId) {
      throw new Error('User not authenticated');
    }
    const userId = session.userId;
    
    const user = await getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.authToken) {
      throw new Error('User needs to verify email');
    }
    if (!user.walletId) {
      throw new Error('User wallet not connected');
    }

    const [game] = await db
      .select()
      .from(coinFlipGames)
      .where(eq(coinFlipGames.id, gameId))
      .execute();

    if (!game) throw new Error('Game not found');
    if (game.playerId !== userId) throw new Error('Unauthorized');
    if (game.expiresAt < new Date()) throw new Error('Game expired');

        
    // Validate wagerAmount
    if (isNaN(wagerAmount) || wagerAmount < 0.01 || wagerAmount > 1) {
        throw new Error('Wager amount must be between 0.01 and 1');
    }
        
    // Validate playerSelection
    if (playerSelection !== 'Heads' && playerSelection !== 'Tails') {
        throw new Error('Player selection must be "Heads" or "Tails"');
    }
  // Make user payment
  const wagerPaymentId = await makeUserPayment(user.authToken, wagerAmount);
  await db
    .update(coinFlipGames)
    .set({
      playerSelection,
      wagerPaymentId,
      wagerAmount:  wagerAmount.toFixed(2),
      wagerPayoutAmount: (wagerAmount * 1.98).toFixed(3),
    })
    .where(eq(coinFlipGames.id, gameId))
    .execute();

  // Process the game result
  const gameResult = await processGameResult(gameId);

  return gameResult;
  }
  catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to process bet' };
  }
}

async function processGameResult(gameId: number) {
  const [game] = await db
    .select()
    .from(coinFlipGames)
    .where(eq(coinFlipGames.id, gameId))
    .execute();

  if (!game) throw new Error('Game not found');

  const userId = game.playerId;
  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (!user.walletId) {
    throw new Error('User wallet not connected');
  }
  // Compute the game result
  const randomSeedBuffer = Buffer.from(game.randomSeed, 'hex');
  const randomValue = randomSeedBuffer.readUInt32LE(0) / 0xFFFFFFFF; // Generate a number between 0 and 1
  const result = randomValue < 0.5 ? 'Heads' : 'Tails';

  const playerWins = result === game.playerSelection;

  let payoutId = null;
  if (playerWins) {
    if(!game.wagerPayoutAmount) {
        throw new Error('Wager payout amount not set');
    }
    // Process payout

    payoutId = await makePayout(parseFloat(game.wagerPayoutAmount), user.walletId, businessWalletAuthToken);
  }

  // Update the game with the result
  await db
    .update(coinFlipGames)
    .set({
      result,
      payoutId,
    })
    .where(eq(coinFlipGames.id, gameId))
    .execute();

  // Update statistics
  await updateStats(userId, playerWins, parseFloat(game.wagerPayoutAmount || '0'), result);

  // Return the game result
  return {
    gameId: game.id,
    randomSeed: game.randomSeed,
    playerSelection: game.playerSelection,
    wagerPaymentId: game.wagerPaymentId,
    wagerAmount: game.wagerAmount,
    wagerPayoutAmount: parseFloat(game.wagerPayoutAmount || '0'),
    result,
    payoutId,
  };
}

async function updateStats(
  playerId: number,
  playerWins: boolean,
  wagerPayoutAmount: number,
  result: 'Heads' | 'Tails'
) {
  await db.transaction(async (tx) => {
    // Update Global Stats
    await upsertStats(tx, null, playerWins, wagerPayoutAmount, result);

    // Update Player Stats
    await upsertStats(tx, playerId, playerWins, wagerPayoutAmount, result);
  });
}

async function upsertStats(
  tx: PostgresJsDatabase,
  playerId: number | null,
  playerWins: boolean,
  wagerPayoutAmount: number,
  result: 'Heads' | 'Tails'
) {
  const whereClause = playerId !== null
    ? eq(coinFlipStats.playerId, playerId)
    : isNull(coinFlipStats.playerId);

  const [stats] = await tx.select().from(coinFlipStats).where(whereClause).execute();

  const updateData = {
    totalGames: (stats?.totalGames ?? 0) + 1,
    totalWins: (stats?.totalWins ?? 0) + (playerWins ? 1 : 0),
    totalLosses: (stats?.totalLosses ?? 0) + (playerWins ? 0 : 1),
    totalPayouts: (parseFloat(stats?.totalPayouts ?? '0') + wagerPayoutAmount).toString(),
    headsWins: (stats?.headsWins ?? 0) + (result === 'Heads' ? 1 : 0),
    tailsWins: (stats?.tailsWins ?? 0) + (result === 'Tails' ? 1 : 0),
  };

  if (stats) {
    await tx
      .update(coinFlipStats)
      .set(updateData)
      .where(eq(coinFlipStats.id, stats.id))
      .execute();
  } else {
    await tx.insert(coinFlipStats).values({ playerId, ...updateData }).execute();
  }
}

// Mock implementations
async function makeUserPayment(authToken: string, wagerAmount: number) {
  // Simulate payment processing
  const paymentResult = await pay(authToken, businessWalletId, wagerAmount);
  return paymentResult.transactionId;
}

async function makePayout(wagerAmount: number, playerWalletId: string, businessWalletAuthToken: string) {
  // Simulate payout processing
  const paymentResult = await pay(businessWalletAuthToken, playerWalletId, wagerAmount);
  return paymentResult.transactionId;
}

export async function fetchStats() {
  return await fetchStatsForPlayer(null);
}

export async function fetchPlayerStats() {
  const session = await verifySession();
  const userId = session.userId;
  return await fetchStatsForPlayer(userId);
}

async function fetchStatsForPlayer(playerId: number | null) {
  const whereClause = playerId !== null
    ? eq(coinFlipStats.playerId, playerId)
    : isNull(coinFlipStats.playerId);

  const [stats] = await db
    .select()
    .from(coinFlipStats)
    .where(whereClause)
    .execute();

  if (!stats) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPayouts: '0',
      headsPercentage: 0,
    };
  }

  const totalGames = stats.totalGames ?? 0;
  const totalWins = stats.totalWins ?? 0;
  const totalLosses = stats.totalLosses ?? 0;
  const totalPayouts = stats.totalPayouts ?? '0';
  const headsWins = stats.headsWins ?? 0;

  const headsPercentage = totalGames > 0 ? (headsWins / totalGames) * 100 : 0;

  return {
    totalGames,
    totalWins,
    totalLosses,
    totalPayouts,
    headsPercentage,
  };
}
