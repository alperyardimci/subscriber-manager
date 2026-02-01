import {getDatabase} from '../database';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const result = db.execute(
    'SELECT value FROM app_settings WHERE key = ?',
    [key],
  );
  return result.rows?.item(0)?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  db.execute(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value],
  );
}

export async function getDefaultAdvanceDays(): Promise<number> {
  const value = await getSetting('default_advance_days');
  return value ? Number(value) : 2;
}

export async function setDefaultAdvanceDays(days: number): Promise<void> {
  await setSetting('default_advance_days', String(days));
}
