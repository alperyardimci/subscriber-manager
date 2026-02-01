import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {Subscription} from '../../../lib/types';

interface Props {
  subscription: Subscription;
  onPress: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function SubscriptionCard({subscription, onPress}: Props) {
  const {t} = useTranslation();
  const daysUntil = getDaysUntil(subscription.next_payment_date);

  const cycleLabel =
    subscription.billing_cycle === 'monthly'
      ? t('subscriptions.monthly')
      : subscription.billing_cycle === 'yearly'
        ? t('subscriptions.yearly')
        : `${subscription.custom_cycle_days} ${t('subscriptions.customDays')}`;

  const urgencyColor =
    daysUntil <= 2
      ? colors.danger
      : daysUntil <= 7
        ? colors.warning
        : colors.textSecondary;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(subscription.id)}
      activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.cycleBadge}>
              <Text style={styles.cycleText}>{cycleLabel}</Text>
            </View>
            {subscription.category && (
              <Text style={styles.category}>{subscription.category}</Text>
            )}
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            {subscription.billing_amount.toFixed(2)} {subscription.currency}
          </Text>
          <Text style={[styles.date, {color: urgencyColor}]}>
            {formatDate(subscription.next_payment_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cycleBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  cycleText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.xs,
  },
});
