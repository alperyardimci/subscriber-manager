import {
  scheduleLocalNotification,
  cancelLocalNotification,
  displayImmediateNotification,
} from './notificationService';
import {getAllSubscriptions, updateSubscription} from '../../db/repositories/subscriptionRepository';

interface SchedulableSubscription {
  id: string;
  name: string;
  billing_amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'custom';
  custom_cycle_days: number | null;
  next_payment_date: string;
  notification_advance_days: number;
  last_notified_date?: string | null;
}

export function calculateNextPaymentDate(
  currentDate: string,
  billingCycle: 'monthly' | 'yearly' | 'custom',
  customDays: number | null,
): string {
  const date = new Date(currentDate);

  switch (billingCycle) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      date.setDate(date.getDate() + (customDays || 30));
      break;
  }

  return date.toISOString().split('T')[0];
}

function getNotificationDate(
  paymentDate: string,
  advanceDays: number,
): Date {
  const date = new Date(paymentDate);
  date.setDate(date.getDate() - advanceDays);
  date.setHours(10, 0, 0, 0);
  return date;
}

export async function scheduleNotification(
  sub: SchedulableSubscription,
): Promise<void> {
  if (sub.notification_advance_days <= 0) {
    return;
  }

  const notifyDate = getNotificationDate(
    sub.next_payment_date,
    sub.notification_advance_days,
  );

  const title = `${sub.name} - Odeme Hatirlatmasi`;
  const body = `${sub.billing_amount.toFixed(2)} ${sub.currency} odemeniz ${sub.notification_advance_days} gun icinde.`;

  if (notifyDate.getTime() <= Date.now()) {
    // Notification date passed - check if payment date is still upcoming
    const paymentDate = new Date(sub.next_payment_date);
    paymentDate.setHours(23, 59, 59, 999);
    if (paymentDate.getTime() >= Date.now()) {
      // Check if we already notified for this payment period
      if (sub.last_notified_date === sub.next_payment_date) {
        return; // Already notified, skip
      }
      // Payment hasn't happened yet, fire notification immediately
      await displayImmediateNotification(sub.id, title, body);
      // Mark as notified for this payment date
      await updateSubscription(sub.id, {last_notified_date: sub.next_payment_date});
    }
    return;
  }

  await scheduleLocalNotification(sub.id, notifyDate, title, body);
}

export async function cancelNotification(subscriptionId: string): Promise<void> {
  await cancelLocalNotification(subscriptionId);
}

export async function rescheduleAllNotifications(): Promise<void> {
  const subscriptions = await getAllSubscriptions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const sub of subscriptions) {
    const paymentDate = new Date(sub.next_payment_date);
    paymentDate.setHours(0, 0, 0, 0);

    if (paymentDate.getTime() < today.getTime()) {
      const newPaymentDate = calculateNextPaymentDate(
        sub.next_payment_date,
        sub.billing_cycle,
        sub.custom_cycle_days,
      );
      // Reset last_notified_date when advancing to new payment period
      await updateSubscription(sub.id, {next_payment_date: newPaymentDate, last_notified_date: null});
      await scheduleNotification({...sub, next_payment_date: newPaymentDate, last_notified_date: null});
    } else {
      await scheduleNotification(sub);
    }
  }
}
