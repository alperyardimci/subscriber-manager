import React, {useState, useEffect, useCallback} from 'react';
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
  KeyboardAvoidingView,
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
  const [nextPaymentDate, setNextPaymentDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
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
    {key: 'productivity', labelKey: 'subscriptions.categoryProductivity'},
    {key: 'gaming', labelKey: 'subscriptions.categoryGaming'},
    {key: 'education', labelKey: 'subscriptions.categoryEducation'},
    {key: 'news', labelKey: 'subscriptions.categoryNews'},
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

  const handleSave = useCallback(async () => {
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
      if (__DEV__) { console.error('Failed to save subscription:', error); }
      Alert.alert(t('common.error'), String(error));
    }
  }, [name, amount, currency, billingCycle, customDays, nextPaymentDate, reminderEnabled, advanceDays, category, notes, serviceUrl, isEditing, editId, navigation, t]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? t('subscriptions.edit') : t('subscriptions.addNew'),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerSave}>
          <Text style={styles.headerSaveText}>{t('subscriptions.save')}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, t, handleSave]);

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
      if (cat && !['video', 'music', 'cloud', 'ai', 'sports', 'productivity', 'gaming', 'education', 'news'].includes(cat)) {
        setIsOtherCategory(true);
      }
      setNotes(sub.notes || '');
    }
  }

  const cycles: {key: BillingCycle; label: string}[] = [
    {key: 'monthly', label: t('subscriptions.monthly')},
    {key: 'yearly', label: t('subscriptions.yearly')},
    {key: 'custom', label: t('subscriptions.custom')},
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
    <ScrollView
      style={styles.scrollView}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, (template && !isEditing) && styles.inputDisabled]}
          value={name}
          onChangeText={setName}
          placeholder={t('subscriptions.namePlaceholder')}
          placeholderTextColor={colors.textLight}
          editable={!(template && !isEditing)}
        />

        {/* Amount + Currency + Cycle — the core row */}
        <View style={styles.priceRow}>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={amount}
            onChangeText={text => setAmount(text.replace(',', '.'))}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />
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

        {/* Billing cycle */}
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
          <TextInput
            style={[styles.input, styles.compactTop]}
            value={customDays}
            onChangeText={setCustomDays}
            keyboardType="number-pad"
            placeholder={t('subscriptions.customDays')}
            placeholderTextColor={colors.textLight}
          />
        )}

        {/* Payment date + Reminder — compact row */}
        <View style={styles.inlineRow}>
          <TouchableOpacity
            style={[styles.dateButton, styles.flex1]}
            onPress={() => setShowDatePicker(prev => !prev)}>
            <Text style={styles.dateLabelText}>{t('subscriptions.nextPayment')}</Text>
            <Text style={styles.dateValueText}>
              {new Date(nextPaymentDate).toLocaleDateString(
                i18n.language === 'tr' ? 'tr-TR' : 'en-US',
                {day: 'numeric', month: 'short'},
              )}
            </Text>
          </TouchableOpacity>
          <View style={[styles.reminderBox, styles.flex1]}>
            <View style={styles.reminderTopRow}>
              <Text style={styles.reminderLabel}>{t('subscriptions.reminderEnabled')}</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{false: colors.border, true: colors.primary}}
                thumbColor={colors.text}
              />
            </View>
            {reminderEnabled && (
              <TextInput
                style={styles.reminderDaysInput}
                value={advanceDays}
                onChangeText={setAdvanceDays}
                keyboardType="number-pad"
                placeholder={t('subscriptions.notifyBeforeDays')}
                placeholderTextColor={colors.textLight}
              />
            )}
          </View>
        </View>
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

        {/* Category chips */}
        <Text style={styles.sectionLabel}>{t('subscriptions.category').toUpperCase()}</Text>
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
            style={[styles.input, styles.compactTop]}
            value={category}
            onChangeText={setCategory}
            placeholder={t('subscriptions.categoryPlaceholder')}
            placeholderTextColor={colors.textLight}
          />
        ) : null}

        <Text style={styles.sectionLabel}>{t('subscriptions.serviceUrl').toUpperCase()}</Text>
        <TextInput
          style={styles.input}
          value={serviceUrl}
          onChangeText={setServiceUrl}
          placeholder={t('subscriptions.urlPlaceholder')}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          keyboardType="url"
        />

        <TextInput
          style={[styles.input, styles.multiline, styles.compactTop]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('subscriptions.notesPlaceholder')}
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={2}
        />
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerSave: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerSaveText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
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
  compactTop: {
    marginTop: spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  currencyOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
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
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  dateLabelText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateValueText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  reminderBox: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reminderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    flex: 1,
  },
  reminderDaysInput: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  categoryChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
