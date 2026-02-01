import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useTranslation} from 'react-i18next';
import {getPasswordWithBiometrics} from '../../../lib/secureStorage';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {Credential} from '../../../lib/types';

interface Props {
  credential: Credential;
}

export function CredentialCard({credential}: Props) {
  const {t} = useTranslation();
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleReveal() {
    if (revealedPassword) {
      setRevealedPassword(null);
      return;
    }
    try {
      const password = await getPasswordWithBiometrics(
        credential.encrypted_password_ref,
      );
      if (password) {
        setRevealedPassword(password);
        setTimeout(() => setRevealedPassword(null), 30000);
      }
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    }
  }

  function handleCopy(value: string, field: string) {
    Clipboard.setString(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.url}>{credential.service_url}</Text>

      <View style={styles.fieldRow}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>{t('credentials.username')}</Text>
          <Text style={styles.fieldValue}>{credential.username}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleCopy(credential.username, 'username')}>
          <Text style={styles.actionText}>
            {copied === 'username' ? t('credentials.copied') : t('credentials.copy')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      <View style={styles.fieldRow}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>{t('credentials.password')}</Text>
          <Text style={styles.fieldValue}>
            {revealedPassword || '••••••••'}
          </Text>
        </View>
        <View style={styles.passwordActions}>
          <TouchableOpacity onPress={handleReveal}>
            <Text style={styles.actionText}>
              {revealedPassword
                ? t('credentials.hide')
                : t('credentials.reveal')}
            </Text>
          </TouchableOpacity>
          {revealedPassword && (
            <TouchableOpacity
              onPress={() => handleCopy(revealedPassword, 'password')}>
              <Text style={styles.actionText}>
                {copied === 'password'
                  ? t('credentials.copied')
                  : t('credentials.copy')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  url: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  fieldValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});
