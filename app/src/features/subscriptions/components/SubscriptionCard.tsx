import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import i18n from '../../../i18n';
import {colors, spacing, fontSize, borderRadius, categoryColor, } from '../../../lib/theme';
import type {Subscription} from '../../../lib/types';

interface Props {
  subscription: Subscription;
  onPress: (id: string) => void;
  hasCredentials?: boolean;
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
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

export function SubscriptionCard({subscription, onPress, hasCredentials, onDelete}: Props) {
  const {t} = useTranslation();
  const daysUntil = getDaysUntil(subscription.next_payment_date);
  const catColor = subscription.category
    ? categoryColor(subscription.category)
    : colors.primary;

  const cycleLabel =
    subscription.billing_cycle === 'monthly'
      ? t('subscriptions.monthly')
      : subscription.billing_cycle === 'yearly'
        ? t('subscriptions.yearly')
        : `${subscription.custom_cycle_days} ${t('subscriptions.customDays')}`;

  const urgencyDotColor =
    daysUntil <= 2
      ? colors.danger
      : daysUntil <= 7
        ? colors.warning
        : null;

  return (
    <TouchableOpacity
      style={[styles.card, {borderLeftColor: catColor}]}
      onPress={() => onPress(subscription.id)}
      activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {subscription.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.cycleBadge, {backgroundColor: catColor + '26'}]}>
              <Text style={[styles.cycleText, {color: catColor}]}>{cycleLabel}</Text>
            </View>
            {subscription.category && (
              <Text style={styles.category}>{subscription.category}</Text>
            )}
            {hasCredentials === true && (
              <Ionicons name="key" size={13} color={colors.success} />
            )}
            {hasCredentials === false && (
              <Ionicons name="key-outline" size={13} color={colors.warning} />
            )}
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            {subscription.billing_amount.toFixed(2)} {subscription.currency}
          </Text>
          <View style={styles.dateRow}>
            {urgencyDotColor && (
              <View style={[styles.urgencyDot, {backgroundColor: urgencyDotColor}]} />
            )}
            <Text style={styles.date}>
              {formatDate(subscription.next_payment_date)}
            </Text>
          </View>
        </View>
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(subscription.id)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Ionicons name="trash-outline" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
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
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  deleteButton: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  cycleText: {
    fontSize: fontSize.xs,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
