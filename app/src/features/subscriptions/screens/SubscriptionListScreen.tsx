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
import {getAllSubscriptions} from '../../../db/repositories/subscriptionRepository';
import {SubscriptionCard} from '../components/SubscriptionCard';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {Subscription, RootStackParamList} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function SubscriptionListScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    if (sub.billing_cycle === 'monthly') {
      return sum + sub.billing_amount;
    }
    if (sub.billing_cycle === 'yearly') {
      return sum + sub.billing_amount / 12;
    }
    if (sub.billing_cycle === 'custom' && sub.custom_cycle_days) {
      return sum + (sub.billing_amount / sub.custom_cycle_days) * 30;
    }
    return sum;
  }, 0);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>{t('subscriptions.empty')}</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('SubscriptionForm')}>
        <Text style={styles.emptyButtonText}>
          {t('subscriptions.emptyAction')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {subscriptions.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryLabel}>{t('subscriptions.totalMonthly')}</Text>
          <Text style={styles.summaryAmount}>
            {monthlyTotal.toFixed(2)} TRY
          </Text>
        </View>
      )}

      <FlatList
        data={subscriptions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <SubscriptionCard
            subscription={item}
            onPress={id => navigation.navigate('SubscriptionDetail', {subscriptionId: id})}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          subscriptions.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TemplatePicker')}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
