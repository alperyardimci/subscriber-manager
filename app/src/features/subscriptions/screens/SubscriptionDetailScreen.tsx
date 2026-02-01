import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {
  getSubscriptionById,
  deleteSubscription,
} from '../../../db/repositories/subscriptionRepository';
import {getCredentialsBySubscription} from '../../../db/repositories/credentialRepository';
import {cancelNotification} from '../../notifications/notificationScheduler';
import {deleteCredentialsBySubscription} from '../../../db/repositories/credentialRepository';
import {CredentialCard} from '../../credentials/components/CredentialCard';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {
  Subscription,
  Credential,
  RootStackParamList,
} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'SubscriptionDetail'>;

export function SubscriptionDetailScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const {subscriptionId} = route.params;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const loadData = useCallback(async () => {
    const sub = await getSubscriptionById(subscriptionId);
    setSubscription(sub);
    const creds = await getCredentialsBySubscription(subscriptionId);
    setCredentials(creds);
  }, [subscriptionId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function handleDelete() {
    Alert.alert(
      t('subscriptions.deleteConfirmTitle'),
      t('subscriptions.deleteConfirmMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await cancelNotification(subscriptionId);
            await deleteCredentialsBySubscription(subscriptionId);
            await deleteSubscription(subscriptionId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  if (!subscription) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </View>
    );
  }

  const cycleLabel =
    subscription.billing_cycle === 'monthly'
      ? t('subscriptions.monthly')
      : subscription.billing_cycle === 'yearly'
        ? t('subscriptions.yearly')
        : `${subscription.custom_cycle_days} ${t('subscriptions.customDays')}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{subscription.name}</Text>
        <Text style={styles.amount}>
          {subscription.billing_amount.toFixed(2)} {subscription.currency}
        </Text>
        <View style={styles.cycleBadge}>
          <Text style={styles.cycleText}>{cycleLabel}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <DetailRow
          label={t('subscriptions.nextPayment')}
          value={new Date(subscription.next_payment_date).toLocaleDateString('tr-TR')}
        />
        <DetailRow
          label={t('subscriptions.notifyBefore')}
          value={`${subscription.notification_advance_days} ${t('subscriptions.customDays')}`}
        />
        {subscription.service_url && (
          <DetailRow
            label={t('subscriptions.serviceUrl')}
            value={subscription.service_url}
          />
        )}
        {subscription.category && (
          <DetailRow
            label={t('subscriptions.category')}
            value={subscription.category}
          />
        )}
        {subscription.notes && (
          <DetailRow label={t('subscriptions.notes')} value={subscription.notes} />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('subscriptions.credentials')}</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CredentialForm', {subscriptionId})
            }>
            <Text style={styles.addLink}>{t('subscriptions.addCredential')}</Text>
          </TouchableOpacity>
        </View>
        {credentials.map(cred => (
          <CredentialCard key={cred.id} credential={cred} />
        ))}
        {credentials.length === 0 && (
          <Text style={styles.emptyCredentials}>—</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('SubscriptionForm', {subscriptionId})
          }>
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  amount: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  cycleBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  cycleText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  addLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyCredentials: {
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
