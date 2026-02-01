import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import {getAllSubscriptions} from '../../../db/repositories/subscriptionRepository';
import {SubscriptionCard} from '../components/SubscriptionCard';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {Subscription, RootStackParamList, BillingCycle} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | BillingCycle;

export function SubscriptionListScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadSubscriptions = useCallback(async () => {
    try {
      const data = await getAllSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  }, [loadSubscriptions]);

  const filteredSubscriptions =
    filter === 'all'
      ? subscriptions
      : subscriptions.filter(sub => sub.billing_cycle === filter);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const upcomingTotals = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const payDate = new Date(sub.next_payment_date);
    payDate.setHours(0, 0, 0, 0);
    if (payDate >= today && payDate <= thirtyDaysLater) {
      acc[sub.currency] = (acc[sub.currency] || 0) + sub.billing_amount;
    }
    return acc;
  }, {});

  const primaryCurrency = Object.keys(upcomingTotals).sort(
    (a, b) => upcomingTotals[b] - upcomingTotals[a],
  )[0] || 'TRY';
  const upcomingTotal = upcomingTotals[primaryCurrency] || 0;

  const filters: {key: FilterType; label: string}[] = [
    {key: 'all', label: t('subscriptions.filterAll')},
    {key: 'monthly', label: t('subscriptions.monthly')},
    {key: 'yearly', label: t('subscriptions.yearly')},
    {key: 'custom', label: t('subscriptions.custom')},
  ];

  const renderEmpty = () => {
    if (subscriptions.length > 0 && filteredSubscriptions.length === 0) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={colors.border} style={{marginBottom: spacing.md}} />
        <Text style={styles.emptyText}>{t('subscriptions.empty')}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('TemplatePicker')}>
          <Text style={styles.emptyButtonText}>
            {t('subscriptions.emptyAction')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {subscriptions.length > 0 && (
        <View style={styles.heroSection}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{t('subscriptions.upcomingPayments').toUpperCase()}</Text>
            <Text style={styles.heroCount}>
              {t('subscriptions.subscriptionCount', {count: subscriptions.length})}
            </Text>
          </View>
          <Text style={styles.heroAmount}>
            {upcomingTotal > 0
              ? `${upcomingTotal.toFixed(2)} ${primaryCurrency}`
              : t('subscriptions.noUpcoming')}
          </Text>
        </View>
      )}

      {subscriptions.length > 0 && (
        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipSelected,
              ]}
              onPress={() => setFilter(f.key)}>
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.key && styles.filterChipTextSelected,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <SubscriptionCard
            subscription={item}
            onPress={id => navigation.navigate('SubscriptionDetail', {subscriptionId: id})}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          filteredSubscriptions.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TemplatePicker')}
        activeOpacity={0.8}>
        <Ionicons name="add" size={22} color={colors.background} />
        <Text style={styles.fabLabel}>{t('common.add')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  heroCount: {
    color: colors.textLight,
    fontSize: fontSize.xs,
  },
  heroAmount: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: colors.background,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  fabLabel: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
