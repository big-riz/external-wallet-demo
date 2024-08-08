import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import { Types } from '@handcash/handcash-sdk';

let db: SQLiteDatabase | null = null;

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  walletId: string | null;
  authToken: string | null;
  balances?: UserBalance[];
  depositInfo?: Types.DepositInfo;
}

export type UserBalance = {
  currencyCode: string;
  logoUrl: string;
  units: number;
  fiatCurrencyCode: string;
  fiatUnits: number;
}


export async function getDb() {
  if (!db) {
    db = await open({
      filename: './mydb.sqlite',
      driver: Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        authToken TEXT,
        walletId TEXT,
        isAdmin BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS user_balances (
        userId INTEGER,
        currencyCode TEXT,
        logoUrl TEXT,
        units REAL,
        fiatCurrencyCode TEXT,
        fiatUnits REAL,
        PRIMARY KEY (userId, currencyCode),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS deposit_info (
        userId INTEGER PRIMARY KEY,
        id TEXT,
        alias TEXT,
        paymail TEXT,
        base58Address TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  }
  return db;
}


export async function createUser(email: string, passwordHash: string) {
    const db = await getDb();
    await db.run('INSERT INTO users (email, passwordHash) VALUES (?, ?)', [email, passwordHash]);
}

export async function findUserByPassword(email: string, passwordHash: string) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE email = ? AND passwordHash = ?', [email, passwordHash]);
}

export async function updateUserAuthToken(id: number, authToken: string) {
    const db = await getDb();
    await db.run('UPDATE users SET authToken = ? WHERE id = ?', [authToken, id]);
}

export async function deleteUser(id: number) {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE id = ?', [id]);
}

export async function clearAuthToken(id: number) {
    const db = await getDb();
    await db.run('UPDATE users SET authToken = NULL WHERE id = ?', [id]);
}

export async function updateUserWalletCreated(id: number, walletId: string) {
    const db = await getDb();
    await db.run('UPDATE users SET walletId = ? WHERE id = ?', [walletId, id]);
}

export async function insertOrUpdateUserBalances(userId: number, balances: Types.UserBalance[]) {
  console.log({ userId, balances });
  const db = await getDb();
  await db.run('BEGIN TRANSACTION');
  try {
    for (const balance of balances) {
      await db.run(`
        INSERT OR REPLACE INTO user_balances 
        (userId, currencyCode, logoUrl, units, fiatCurrencyCode, fiatUnits)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        balance.currency.code,
        balance.currency.logoUrl,
        balance.units,
        balance.fiatEquivalent.currencyCode,
        balance.fiatEquivalent.units
      ]);
    }
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

export async function insertOrUpdateDepositInfo(userId: number, depositInfo: Types.DepositInfo) {
  const db = await getDb();
  await db.run(`
    INSERT OR REPLACE INTO deposit_info 
    (userId, id, alias, paymail, base58Address)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, depositInfo.id, depositInfo.alias, depositInfo.paymail, depositInfo.base58Address]);
}

export async function getUser(id: number): Promise<User | undefined> {
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  if (user) {
    user.balances = await db.all('SELECT * FROM user_balances WHERE userId = ?', [id]);
    user.depositInfo = await db.get('SELECT * FROM deposit_info WHERE userId = ?', [id]);
  }
  return user;
}

export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  const users = await db.all('SELECT * FROM users');
  for (const user of users) {
    user.balances = await db.all('SELECT * FROM user_balances WHERE userId = ?', [user.id]);
    user.depositInfo = await db.get('SELECT * FROM deposit_info WHERE userId = ?', [user.id]);
  }
  return users;
}
