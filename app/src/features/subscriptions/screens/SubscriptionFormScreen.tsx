import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {
  createSubscription,
  getSubscriptionById,
  updateSubscription,
} from '../../../db/repositories/subscriptionRepository';
import {scheduleNotification, cancelNotification} from '../../notifications/notificationScheduler';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {RootStackParamList, BillingCycle} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'SubscriptionForm'>;

export function SubscriptionFormScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const editId = route.params?.subscriptionId;
  const isEditing = !!editId;

  const [name, setName] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customDays, setCustomDays] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [advanceDays, setAdvanceDays] = useState('2');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editId) {
      loadExisting(editId);
    }
  }, [editId]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? t('subscriptions.edit') : t('subscriptions.addNew'),
    });
  }, [navigation, isEditing, t]);

  async function loadExisting(id: string) {
    const sub = await getSubscriptionById(id);
    if (sub) {
      setName(sub.name);
      setServiceUrl(sub.service_url || '');
      setAmount(sub.billing_amount.toString());
      setCurrency(sub.currency);
      setBillingCycle(sub.billing_cycle);
      setCustomDays(sub.custom_cycle_days?.toString() || '');
      setNextPaymentDate(sub.next_payment_date);
      setAdvanceDays(sub.notification_advance_days.toString());
      setCategory(sub.category || '');
      setNotes(sub.notes || '');
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('subscriptions.name'));
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(t('common.error'), t('subscriptions.amount'));
      return;
    }
    if (billingCycle === 'custom' && (!customDays || Number(customDays) <= 0)) {
      Alert.alert(t('common.error'), t('subscriptions.customDays'));
      return;
    }

    const subData = {
      name: name.trim(),
      service_url: serviceUrl.trim() || null,
      billing_amount: Number(amount),
      currency,
      billing_cycle: billingCycle,
      custom_cycle_days:
        billingCycle === 'custom' ? Number(customDays) : null,
      next_payment_date: nextPaymentDate,
      notification_advance_days: Number(advanceDays) || 2,
      category: category.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (isEditing && editId) {
        await updateSubscription(editId, subData);
        await cancelNotification(editId);
        await scheduleNotification({
          id: editId,
          ...subData,
        });
      } else {
        const created = await createSubscription(subData);
        await scheduleNotification(created);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save subscription:', error);
      Alert.alert(t('common.error'), String(error));
    }
  }

  const cycles: {key: BillingCycle; label: string}[] = [
    {key: 'monthly', label: t('subscriptions.monthly')},
    {key: 'yearly', label: t('subscriptions.yearly')},
    {key: 'custom', label: t('subscriptions.custom')},
  ];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>{t('subscriptions.name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('subscriptions.namePlaceholder')}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>{t('subscriptions.serviceUrl')}</Text>
        <TextInput
          style={styles.input}
          value={serviceUrl}
          onChangeText={setServiceUrl}
          placeholder={t('subscriptions.urlPlaceholder')}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          keyboardType="url"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t('subscriptions.amount')}</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder={t('subscriptions.amountPlaceholder')}
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>{t('subscriptions.currency')}</Text>
            <View style={styles.currencyRow}>
              {['TRY', 'USD', 'EUR'].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.currencyOption,
                    currency === c && styles.currencySelected,
                  ]}
                  onPress={() => setCurrency(c)}>
                  <Text
                    style={[
                      styles.currencyText,
                      currency === c && styles.currencyTextSelected,
                    ]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.label}>{t('subscriptions.billingCycle')}</Text>
        <View style={styles.segmentRow}>
          {cycles.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.segment,
                billingCycle === c.key && styles.segmentSelected,
              ]}
              onPress={() => setBillingCycle(c.key)}>
              <Text
                style={[
                  styles.segmentText,
                  billingCycle === c.key && styles.segmentTextSelected,
                ]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {billingCycle === 'custom' && (
          <>
            <Text style={styles.label}>{t('subscriptions.customDays')}</Text>
            <TextInput
              style={styles.input}
              value={customDays}
              onChangeText={setCustomDays}
              keyboardType="number-pad"
              placeholder="90"
              placeholderTextColor={colors.textLight}
            />
          </>
        )}

        <Text style={styles.label}>{t('subscriptions.nextPayment')}</Text>
        <TextInput
          style={styles.input}
          value={nextPaymentDate}
          onChangeText={setNextPaymentDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>{t('subscriptions.notifyBefore')}</Text>
        <TextInput
          style={styles.input}
          value={advanceDays}
          onChangeText={setAdvanceDays}
          keyboardType="number-pad"
          placeholder="2"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>{t('subscriptions.category')}</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>{t('subscriptions.notes')}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('subscriptions.notesPlaceholder')}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('subscriptions.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  currencySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  currencyTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  segmentTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
