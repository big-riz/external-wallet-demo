import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

let db: SQLiteDatabase | null = null;

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  walletId: string | null;
  authToken: string | null;
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
      )
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

export async function getUsers() {
  const db = await getDb();
  return db.all('SELECT * FROM users');
}

export async function getUser(id: number) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
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