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
import i18n from '../../../i18n';
import {requestPermissions} from '../../notifications/notificationService';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';

export function SettingsScreen() {
  const {t} = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultAdvanceDays, setDefaultAdvanceDays] = useState(2);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    checkPermissions();
  }, []);

  async function checkPermissions() {
    const granted = await requestPermissions();
    setNotificationsEnabled(granted);
  }

  function toggleLanguage() {
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
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
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

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
            trackColor={{true: colors.primary}}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.defaultAdvanceDays')}</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() =>
                setDefaultAdvanceDays(Math.max(1, defaultAdvanceDays - 1))
              }>
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{defaultAdvanceDays}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setDefaultAdvanceDays(defaultAdvanceDays + 1)}>
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.row} onPress={openNotificationSettings}>
          <Text style={styles.rowLabel}>{t('settings.openSettings')}</Text>
          <Text style={styles.rowChevron}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity style={styles.row} onPress={toggleLanguage}>
          <Text style={styles.rowLabel}>
            {currentLang === 'tr'
              ? t('settings.turkish')
              : t('settings.english')}
          </Text>
          <Text style={styles.rowValue}>
            {currentLang === 'tr' ? 'TR' : 'EN'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.autofill')}</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            {Platform.OS === 'ios' ? 'iOS AutoFill' : 'Android Autofill'}
          </Text>
          <Text style={styles.rowValue}>{t('settings.autofillSetup')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
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
    textTransform: 'uppercase',
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
  rowChevron: {
    fontSize: fontSize.md,
    color: colors.textLight,
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
});
