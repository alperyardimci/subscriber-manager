import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import i18n from '../../../i18n';
import {requestPermissions} from '../../notifications/notificationService';
import {
  getDefaultAdvanceDays,
  setDefaultAdvanceDays as saveDefaultAdvanceDays,
} from '../../../db/repositories/settingsRepository';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';

const LANGUAGES = [
  {code: 'tr', label: 'Türkçe'},
  {code: 'en', label: 'English'},
] as const;

export function SettingsScreen() {
  const {t} = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultAdvanceDays, setDefaultAdvanceDays] = useState(2);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    checkPermissions();
    getDefaultAdvanceDays().then(setDefaultAdvanceDays);
  }, []);

  async function checkPermissions() {
    const granted = await requestPermissions();
    setNotificationsEnabled(granted);
  }

  function selectLanguage(langCode: string) {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  }

  function openNotificationSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications').toUpperCase()}</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.notificationsEnabled')}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={val => {
              if (!val) {
                setNotificationsEnabled(false);
              } else {
                checkPermissions();
              }
            }}
            trackColor={{false: colors.border, true: colors.primary}}
            thumbColor={colors.text}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.defaultAdvanceDays')}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => {
                const next = Math.max(1, defaultAdvanceDays - 1);
                setDefaultAdvanceDays(next);
                saveDefaultAdvanceDays(next);
              }}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{defaultAdvanceDays}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => {
                const next = defaultAdvanceDays + 1;
                setDefaultAdvanceDays(next);
                saveDefaultAdvanceDays(next);
              }}>
              <Ionicons name="add" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.row} onPress={openNotificationSettings}>
          <Text style={styles.rowLabel}>{t('settings.openSettings')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language').toUpperCase()}</Text>
        {LANGUAGES.map(lang => {
          const isSelected = currentLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={styles.row}
              onPress={() => selectLanguage(lang.code)}>
              <Text style={styles.rowLabel}>{lang.label}</Text>
              {isSelected ? (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.autofill').toUpperCase()}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.autofillLabel')}</Text>
          <Text style={styles.rowValue}>{t('settings.autofillSetup')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about').toUpperCase()}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.version')}</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  rowValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepperValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
});
