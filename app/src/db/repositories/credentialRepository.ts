import {getDatabase} from '../database';
import {generateUUID} from '../../lib/uuid';
import type {Credential} from '../../lib/types';

export async function getCredentialsBySubscription(
  subscriptionId: string,
): Promise<Credential[]> {
  const db = await getDatabase();
  const result = db.execute(
    'SELECT * FROM credentials WHERE subscription_id = ? ORDER BY created_at ASC',
    [subscriptionId],
  );
  const rows: Credential[] = [];
  if (result.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i) as Credential);
    }
  }
  return rows;
}

export async function getCredentialById(
  id: string,
): Promise<Credential | null> {
  const db = await getDatabase();
  const result = db.execute('SELECT * FROM credentials WHERE id = ?', [id]);
  if (result.rows && result.rows.length > 0) {
    return result.rows.item(0) as Credential;
  }
  return null;
}

export async function createCredential(
  cred: Omit<Credential, 'id' | 'created_at' | 'updated_at'>,
): Promise<Credential> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  db.execute(
    `INSERT INTO credentials (
      id, subscription_id, service_url, username,
      encrypted_password_ref, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      cred.subscription_id,
      cred.service_url,
      cred.username,
      cred.encrypted_password_ref,
      now,
      now,
    ],
  );

  return {...cred, id, created_at: now, updated_at: now};
}

export async function updateCredential(
  id: string,
  cred: Partial<Omit<Credential, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | null)[] = [];

  const entries = Object.entries(cred) as [string, string | null][];
  for (const [key, value] of entries) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.execute(
    `UPDATE credentials SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteCredential(id: string): Promise<void> {
  const db = await getDatabase();
  db.execute('DELETE FROM credentials WHERE id = ?', [id]);
}

export async function deleteCredentialsBySubscription(
  subscriptionId: string,
): Promise<void> {
  const db = await getDatabase();
  db.execute('DELETE FROM credentials WHERE subscription_id = ?', [
    subscriptionId,
  ]);
}
