import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import {getAllSubscriptions, deleteSubscription} from '../../../db/repositories/subscriptionRepository';
import {deleteCredentialsBySubscription, getCredentialCountsBySubscriptions} from '../../../db/repositories/credentialRepository';
import {cancelNotification} from '../../notifications/notificationScheduler';
import {SubscriptionCard} from '../components/SubscriptionCard';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {Subscription, RootStackParamList, BillingCycle} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | BillingCycle;

const CURRENCY_ORDER = ['TRY', 'USD', 'EUR'];

function sortCurrencies(totals: Record<string, number>): string[] {
  return Object.keys(totals).sort(
    (a, b) => CURRENCY_ORDER.indexOf(a) - CURRENCY_ORDER.indexOf(b),
  );
}

function CurrencyRow({totals, currencies, compact}: {totals: Record<string, number>; currencies: string[]; compact?: boolean}) {
  return (
    <View style={styles.currencyRow}>
      {currencies.map((cur, i) => (
        <React.Fragment key={cur}>
          {i > 0 && <Text style={[styles.plusSign, compact && styles.plusSignCompact]}>+</Text>}
          <Text style={[styles.currencyAmount, compact && styles.currencyAmountCompact]}>
            {totals[cur].toFixed(2)}{' '}
            <Text style={[styles.currencyCode, compact && styles.currencyCodeCompact]}>{cur}</Text>
          </Text>
        </React.Fragment>
      ))}
    </View>
  );
}

export function SubscriptionListScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [credentialCounts, setCredentialCounts] = useState<Map<string, number>>(new Map());

  const loadSubscriptions = useCallback(async () => {
    try {
      const [data, counts] = await Promise.all([
        getAllSubscriptions(),
        getCredentialCountsBySubscriptions(),
      ]);
      setSubscriptions(data);
      setCredentialCounts(counts);
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

  const yearlyTotals = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    let annualAmount: number;
    if (sub.billing_cycle === 'yearly') {
      annualAmount = sub.billing_amount;
    } else if (sub.billing_cycle === 'monthly') {
      annualAmount = sub.billing_amount * 12;
    } else {
      const days = sub.custom_cycle_days || 30;
      annualAmount = sub.billing_amount * (365 / days);
    }
    acc[sub.currency] = (acc[sub.currency] || 0) + annualAmount;
    return acc;
  }, {});

  const sortedUpcoming = sortCurrencies(upcomingTotals);
  const sortedYearly = sortCurrencies(yearlyTotals);
  const hasUpcoming = sortedUpcoming.length > 0;

  const filters: {key: FilterType; label: string}[] = [
    {key: 'all', label: t('subscriptions.filterAll')},
    {key: 'monthly', label: t('subscriptions.monthly')},
    {key: 'yearly', label: t('subscriptions.yearly')},
    {key: 'custom', label: t('subscriptions.custom')},
  ];

  function handleDelete(id: string) {
    Alert.alert(
      t('subscriptions.deleteConfirmTitle'),
      t('subscriptions.deleteConfirmMessage'),
      [
        {text: t('subscriptions.cancel'), style: 'cancel'},
        {
          text: t('subscriptions.delete'),
          style: 'destructive',
          onPress: async () => {
            await cancelNotification(id);
            await deleteCredentialsBySubscription(id);
            await deleteSubscription(id);
            loadSubscriptions();
          },
        },
      ],
    );
  }

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
          {/* Upcoming 30 days */}
          <View style={styles.heroMain}>
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>{t('subscriptions.upcomingPayments').toUpperCase()}</Text>
              <Text style={styles.heroCount}>
                {t('subscriptions.subscriptionCount', {count: subscriptions.length})}
              </Text>
            </View>
            {hasUpcoming ? (
              <CurrencyRow totals={upcomingTotals} currencies={sortedUpcoming} compact />
            ) : (
              <Text style={styles.noUpcoming}>{t('subscriptions.noUpcoming')}</Text>
            )}
          </View>

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
            hasCredentials={(credentialCounts.get(item.id) ?? 0) > 0}
            onDelete={handleDelete}
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

      {subscriptions.length > 0 && sortedYearly.length > 0 && (
        <View style={styles.fixedFooter}>
          <Text style={styles.footerLabel}>{t('subscriptions.totalYearly').toUpperCase()}</Text>
          <CurrencyRow totals={yearlyTotals} currencies={sortedYearly} compact />
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, subscriptions.length > 0 && sortedYearly.length > 0 && styles.fabAboveFooter]}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroMain: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroCount: {
    color: colors.textLight,
    fontSize: fontSize.xs,
  },
  noUpcoming: {
    color: colors.textLight,
    fontSize: fontSize.lg,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencyAmount: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  currencyCode: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  plusSign: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  fixedFooter: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  currencyAmountCompact: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  currencyCodeCompact: {
    fontSize: fontSize.xs,
  },
  plusSignCompact: {
    fontSize: fontSize.sm,
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
  fabAboveFooter: {
    bottom: spacing.lg + 48,
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
