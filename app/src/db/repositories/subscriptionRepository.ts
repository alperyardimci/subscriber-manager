import {getDatabase} from '../database';
import {generateUUID} from '../../lib/uuid';
import type {Subscription} from '../../lib/types';

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = await getDatabase();
  const result = db.execute(
    'SELECT * FROM subscriptions ORDER BY next_payment_date ASC',
  );
  const rows: Subscription[] = [];
  if (result.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i) as Subscription);
    }
  }
  return rows;
}

export async function getSubscriptionById(
  id: string,
): Promise<Subscription | null> {
  const db = await getDatabase();
  const result = db.execute('SELECT * FROM subscriptions WHERE id = ?', [id]);
  if (result.rows && result.rows.length > 0) {
    return result.rows.item(0) as Subscription;
  }
  return null;
}

export async function createSubscription(
  sub: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>,
): Promise<Subscription> {
  const db = await getDatabase();
  const id = generateUUID();
  const now = new Date().toISOString();

  db.execute(
    `INSERT INTO subscriptions (
      id, name, service_url, billing_amount, currency,
      billing_cycle, custom_cycle_days, next_payment_date,
      notification_advance_days, category, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      sub.name,
      sub.service_url,
      sub.billing_amount,
      sub.currency,
      sub.billing_cycle,
      sub.custom_cycle_days,
      sub.next_payment_date,
      sub.notification_advance_days,
      sub.category,
      sub.notes,
      now,
      now,
    ],
  );

  return {...sub, id, created_at: now, updated_at: now};
}

export async function updateSubscription(
  id: string,
  sub: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const entries = Object.entries(sub) as [string, string | number | null][];
  for (const [key, value] of entries) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.execute(
    `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteSubscription(id: string): Promise<void> {
  const db = await getDatabase();
  db.execute('DELETE FROM subscriptions WHERE id = ?', [id]);
}

export async function getUpcomingSubscriptions(
  days: number,
): Promise<Subscription[]> {
  const db = await getDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const result = db.execute(
    `SELECT * FROM subscriptions
     WHERE next_payment_date <= ?
     ORDER BY next_payment_date ASC`,
    [futureDate.toISOString().split('T')[0]],
  );

  const rows: Subscription[] = [];
  if (result.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i) as Subscription);
    }
  }
  return rows;
}
