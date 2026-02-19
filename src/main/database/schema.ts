import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  description: string;
  up: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Create initial tables',
    up: `
      CREATE TABLE IF NOT EXISTS supporters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS supporter_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supporter_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (supporter_id) REFERENCES supporters(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS supporter_phones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supporter_id INTEGER NOT NULL,
        phone TEXT NOT NULL,
        is_primary INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (supporter_id) REFERENCES supporters(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supporter_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        currency TEXT NOT NULL DEFAULT 'HUF',
        donation_date TEXT NOT NULL,
        payment_method TEXT,
        reference TEXT,
        notes TEXT,
        source TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (supporter_id) REFERENCES supporters(id) ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS idx_supporter_emails_supporter_id ON supporter_emails(supporter_id);
      CREATE INDEX IF NOT EXISTS idx_supporter_emails_email ON supporter_emails(email);
      CREATE INDEX IF NOT EXISTS idx_supporter_phones_supporter_id ON supporter_phones(supporter_id);
      CREATE INDEX IF NOT EXISTS idx_supporter_phones_phone ON supporter_phones(phone);
      CREATE INDEX IF NOT EXISTS idx_donations_supporter_id ON donations(supporter_id);
      CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date);
      CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(reference);
    `,
  },
  {
    version: 2,
    description: 'Add cid, nickname, country, postcode, city columns to supporters',
    up: `
      ALTER TABLE supporters ADD COLUMN cid TEXT;
      ALTER TABLE supporters ADD COLUMN nickname TEXT;
      ALTER TABLE supporters ADD COLUMN country TEXT;
      ALTER TABLE supporters ADD COLUMN postcode TEXT;
      ALTER TABLE supporters ADD COLUMN city TEXT;
    `,
  },
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      description TEXT,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedVersions = new Set(
    db
      .prepare<[], { version: number }>('SELECT version FROM schema_migrations')
      .all()
      .map((row) => row.version),
  );

  const runMigration = db.transaction((migration: Migration) => {
    db.exec(migration.up);
    db.prepare(
      'INSERT INTO schema_migrations (version, description) VALUES (?, ?)',
    ).run(migration.version, migration.description);
  });

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      runMigration(migration);
      console.log(`Migration ${migration.version} applied: ${migration.description}`);
    }
  }
}
