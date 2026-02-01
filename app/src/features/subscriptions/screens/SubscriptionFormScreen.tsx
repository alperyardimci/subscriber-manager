import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import i18n from '../../../i18n';
import {
  createSubscription,
  getSubscriptionById,
  updateSubscription,
} from '../../../db/repositories/subscriptionRepository';
import {scheduleNotification, cancelNotification} from '../../notifications/notificationScheduler';
import {getDefaultAdvanceDays} from '../../../db/repositories/settingsRepository';
import {colors, spacing, fontSize, borderRadius, categoryColor} from '../../../lib/theme';
import type {RootStackParamList, BillingCycle} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'SubscriptionForm'>;

export function SubscriptionFormScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const editId = route.params?.subscriptionId;
  const template = route.params?.template;
  const isEditing = !!editId;

  const [name, setName] = useState(() =>
    template && !editId ? t(template.nameKey) : '',
  );
  const [serviceUrl, setServiceUrl] = useState(() =>
    template && !editId ? template.serviceUrl : '',
  );
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() =>
    template && !editId ? template.defaultBillingCycle : 'monthly',
  );
  const [customDays, setCustomDays] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [advanceDays, setAdvanceDays] = useState('');
  const [category, setCategory] = useState(() =>
    template && !editId ? template.category : '',
  );
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isOtherCategory, setIsOtherCategory] = useState(false);

  const CATEGORY_OPTIONS = [
    {key: 'video', labelKey: 'subscriptions.categoryVideo'},
    {key: 'music', labelKey: 'subscriptions.categoryMusic'},
    {key: 'cloud', labelKey: 'subscriptions.categoryCloud'},
    {key: 'ai', labelKey: 'subscriptions.categoryAI'},
    {key: 'sports', labelKey: 'subscriptions.categorySports'},
  ] as const;

  useEffect(() => {
    if (editId) {
      loadExisting(editId);
    } else {
      getDefaultAdvanceDays().then(days => setAdvanceDays(String(days)));
    }
  }, [editId]);

  useEffect(() => {
    if (template && !editId) {
      setName(t(template.nameKey));
      setServiceUrl(template.serviceUrl);
      setBillingCycle(template.defaultBillingCycle);
      setCategory(template.category);
    }
  }, [template?.id]);

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
      setReminderEnabled(sub.notification_advance_days > 0);
      if (sub.notification_advance_days > 0) {
        setAdvanceDays(sub.notification_advance_days.toString());
      } else {
        getDefaultAdvanceDays().then(days => setAdvanceDays(String(days)));
      }
      const cat = sub.category || '';
      setCategory(cat);
      if (cat && !['video', 'music', 'cloud', 'ai', 'sports'].includes(cat)) {
        setIsOtherCategory(true);
      }
      setNotes(sub.notes || '');
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('subscriptions.validationNameRequired'));
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(t('common.error'), t('subscriptions.validationAmountRequired'));
      return;
    }
    if (billingCycle === 'custom' && (!customDays || Number(customDays) <= 0)) {
      Alert.alert(t('common.error'), t('subscriptions.validationCustomDaysRequired'));
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
      notification_advance_days: reminderEnabled ? (Number(advanceDays) || 2) : 0,
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
        <Text style={styles.label}>{t('subscriptions.name').toUpperCase()}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('subscriptions.namePlaceholder')}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>{t('subscriptions.serviceUrl').toUpperCase()}</Text>
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
            <Text style={styles.label}>{t('subscriptions.amount').toUpperCase()}</Text>
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
            <Text style={styles.label}>{t('subscriptions.currency').toUpperCase()}</Text>
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

        <Text style={styles.label}>{t('subscriptions.billingCycle').toUpperCase()}</Text>
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
            <Text style={styles.label}>{t('subscriptions.customDays').toUpperCase()}</Text>
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

        <Text style={styles.label}>{t('subscriptions.nextPayment').toUpperCase()}</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(prev => !prev)}>
          <Text style={styles.dateButtonText}>
            {new Date(nextPaymentDate).toLocaleDateString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
              {day: 'numeric', month: 'long', year: 'numeric'},
            )}
          </Text>
        </TouchableOpacity>
        {showDatePicker ? (
          <DateTimePicker
            value={new Date(nextPaymentDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            locale={i18n.language === 'tr' ? 'tr' : 'en'}
            themeVariant="dark"
            accentColor={colors.primary}
            onChange={(_event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
              if (selectedDate) {
                setNextPaymentDate(selectedDate.toISOString().split('T')[0]);
              }
            }}
          />
        ) : null}

        <Text style={styles.label}>{t('subscriptions.reminderEnabled').toUpperCase()}</Text>
        <View style={styles.reminderRow}>
          <Text style={styles.reminderLabel}>
            {reminderEnabled ? t('subscriptions.notifyBeforeDays') : t('subscriptions.reminderOff')}
          </Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{false: colors.border, true: colors.primary}}
            thumbColor={colors.text}
          />
        </View>
        {reminderEnabled && (
          <TextInput
            style={[styles.input, {marginTop: spacing.xs}]}
            value={advanceDays}
            onChangeText={setAdvanceDays}
            keyboardType="number-pad"
            placeholder="2"
            placeholderTextColor={colors.textLight}
          />
        )}

        <Text style={styles.label}>{t('subscriptions.category').toUpperCase()}</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.map(({key, labelKey}) => {
            const isSelected = category === key && !isOtherCategory;
            const catColor = categoryColor(key);
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? {backgroundColor: catColor, borderColor: catColor}
                    : {borderColor: colors.border},
                ]}
                onPress={() => {
                  setIsOtherCategory(false);
                  setCategory(prev => (prev === key ? '' : key));
                }}>
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? {color: colors.background}
                      : {color: colors.text},
                  ]}>
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              isOtherCategory
                ? {backgroundColor: colors.primary, borderColor: colors.primary}
                : {borderColor: colors.border},
            ]}
            onPress={() => {
              if (isOtherCategory) {
                setIsOtherCategory(false);
                setCategory('');
              } else {
                setIsOtherCategory(true);
                setCategory('');
              }
            }}>
            <Text
              style={[
                styles.categoryChipText,
                isOtherCategory
                  ? {color: colors.background}
                  : {color: colors.text},
              ]}>
              {t('subscriptions.categoryOther')}
            </Text>
          </TouchableOpacity>
        </View>
        {isOtherCategory ? (
          <TextInput
            style={[styles.input, {marginTop: spacing.xs}]}
            value={category}
            onChangeText={setCategory}
            placeholder={t('subscriptions.categoryPlaceholder')}
            placeholderTextColor={colors.textLight}
          />
        ) : null}

        <Text style={styles.label}>{t('subscriptions.notes').toUpperCase()}</Text>
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
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceLight,
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
    color: colors.background,
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
    color: colors.background,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reminderLabel: {
    fontSize: fontSize.md,
    color: colors.text,
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
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
