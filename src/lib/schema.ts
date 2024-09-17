// schema.ts
import { pgTable, serial, varchar, boolean, integer, numeric, timestamp , decimal} from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
  authToken: varchar('authToken', { length: 255 }),
  walletId: varchar('walletId', { length: 255 }),
  isAdmin: boolean('isAdmin').notNull().default(false),
});

export type User = InferModel<typeof users>;

export const coinFlipGames = pgTable('coin_flip_games', {
  id: serial('id').primaryKey(),
  randomSeed: varchar('random_seed', { length: 255 }).notNull(),
  playerId: integer('player_id').references(() => users.id).notNull(),
  playerSelection: varchar('player_selection', { length: 5 }),
  wagerPaymentId: varchar('wager_payment_id', { length: 255 }),
  wagerAmount: decimal('wager_amount', { precision: 10, scale: 5 }),
  wagerPayoutAmount: decimal('wager_payout_amount', { precision: 10, scale: 5 }),
  result: varchar('result', { length: 5 }),
  payoutId: varchar('payout_id', { length: 255 }),
  expiresAt: timestamp('expires_at').notNull(),
});


export const coinFlipStats = pgTable('coin_flip_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => users.id),
  totalGames: integer('total_games').default(0),
  totalWins: integer('total_wins').default(0),
  totalLosses: integer('total_losses').default(0),
  totalPayouts: numeric('total_payouts', { precision: 20, scale: 2 }).default('0'),
  headsWins: integer('heads_wins').default(0),
  tailsWins: integer('tails_wins').default(0),
});

export type CoinFlipGame = InferModel<typeof coinFlipGames>;
export type CoinFlipStats = InferModel<typeof coinFlipStats>;


