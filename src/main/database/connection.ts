import path from 'node:path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { runMigrations } from './schema';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = path.join(app.getPath('userData'), 'tamogatas.db');
  console.log(`Opening database at: ${dbPath}`);

  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed.');
  }
}
