import type {QuickSQLiteConnection} from 'react-native-quick-sqlite';

interface Migration {
  version: number;
  up: (db: QuickSQLiteConnection) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (db: QuickSQLiteConnection) => {
      db.execute(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          service_url TEXT,
          billing_amount REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'TRY',
          billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('monthly', 'yearly', 'custom')),
          custom_cycle_days INTEGER,
          next_payment_date TEXT NOT NULL,
          notification_advance_days INTEGER NOT NULL DEFAULT 2,
          category TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      db.execute(`
        CREATE TABLE IF NOT EXISTS credentials (
          id TEXT PRIMARY KEY,
          subscription_id TEXT NOT NULL,
          service_url TEXT NOT NULL,
          username TEXT NOT NULL,
          encrypted_password_ref TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
        );
      `);

      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_credentials_subscription
        ON credentials(subscription_id);
      `);

      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment
        ON subscriptions(next_payment_date);
      `);
    },
  },
  {
    version: 2,
    up: (db: QuickSQLiteConnection) => {
      db.execute(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      db.execute(
        "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('default_advance_days', '2')",
      );
    },
  },
  {
    version: 3,
    up: (db: QuickSQLiteConnection) => {
      db.execute(`
        ALTER TABLE subscriptions ADD COLUMN last_notified_date TEXT;
      `);
    },
  },
];

export async function runMigrations(db: QuickSQLiteConnection): Promise<void> {
  db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const result = db.execute(
    'SELECT COALESCE(MAX(version), 0) as current_version FROM schema_migrations',
  );
  const currentVersion = result.rows?.item(0)?.current_version ?? 0;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      migration.up(db);
      db.execute(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        [migration.version, new Date().toISOString()],
      );
    }
  }
}
