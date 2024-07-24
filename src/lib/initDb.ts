import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function initDb() {
  const dbPath = path.resolve(process.cwd(), 'mydb.sqlite');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      auth_token TEXT NOT NULL
    )
  `);

  console.log('Database initialized successfully');
  await db.close();
}

export default initDb;