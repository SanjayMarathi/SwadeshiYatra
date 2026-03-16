import fs from "node:fs/promises";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";

let dbPromise: Promise<Database> | null = null;

const getDbPath = () => path.join(process.cwd(), "data", "swadeshiyatra.db");

const initSchema = async (db: Database) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      location TEXT,
      country TEXT,
      price INTEGER,
      expertise TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);
};

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const dbFilePath = getDbPath();
      await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
      const db = await open({
        filename: dbFilePath,
        driver: sqlite3.Database,
      });
      await initSchema(db);
      return db;
    })();
  }
  return dbPromise;
};
