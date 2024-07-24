import { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

let db: SQLiteDatabase | null = null;

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
        auth_token TEXT
      )
    `);
  }
  return db;
}

export async function createUser(email: string) {
    const db = await getDb();
    await db.run('INSERT INTO users (email) VALUES (?)', [email]);
}

export async function updateUserAuthToken(email: string, authToken: string) {
    const db = await getDb();
    await db.run('UPDATE users SET auth_token = ? WHERE email = ?', [authToken, email]);
}

export async function getUsers() {
  const db = await getDb();
  return db.all('SELECT * FROM users');
}

export async function getUser(email: string) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function deleteUser(email: string) {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
}

export async function clearAuthToken(email: string) {
    const db = await getDb();
    await db.run('UPDATE users SET auth_token = NULL WHERE email = ?', [email]);
}