import {open, type QuickSQLiteConnection} from 'react-native-quick-sqlite';
import * as Keychain from 'react-native-keychain';
import {runMigrations} from './migrations';

const DB_NAME = 'subscriber_manager.db';
const DB_KEY_SERVICE = 'com.subscribermanager.dbkey';

let db: QuickSQLiteConnection | null = null;

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({service: DB_KEY_SERVICE});
  if (existing) {
    return existing.password;
  }

  const newKey = generateKey();
  await Keychain.setGenericPassword('dbkey', newKey, {
    service: DB_KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return newKey;
}

export async function getDatabase(): Promise<QuickSQLiteConnection> {
  if (db) {
    return db;
  }

  const encryptionKey = await getOrCreateEncryptionKey();

  db = open({name: DB_NAME});

  // SQLCipher PRAGMA key requires string literal (does not support parameter binding).
  // Safe: key is sourced from Keychain, not user input.
  db.execute(`PRAGMA key = '${encryptionKey}';`);
  db.execute('PRAGMA foreign_keys = ON;');

  await runMigrations(db);

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}
