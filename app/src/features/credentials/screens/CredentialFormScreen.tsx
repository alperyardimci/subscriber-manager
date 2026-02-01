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
import {getSubscriptionById} from '../../../db/repositories/subscriptionRepository';
import {
  createCredential,
  getCredentialById,
  updateCredential,
} from '../../../db/repositories/credentialRepository';
import {storePassword, deletePassword} from '../../../lib/secureStorage';
import {generateUUID} from '../../../lib/uuid';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import type {RootStackParamList} from '../../../lib/types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CredentialForm'>;

export function CredentialFormScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const {subscriptionId, credentialId} = route.params;
  const isEditing = !!credentialId;

  const [serviceUrl, setServiceUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadDefaults();
  }, []);

  async function loadDefaults() {
    if (credentialId) {
      const cred = await getCredentialById(credentialId);
      if (cred) {
        setServiceUrl(cred.service_url);
        setUsername(cred.username);
      }
    } else {
      const sub = await getSubscriptionById(subscriptionId);
      if (sub?.service_url) {
        setServiceUrl(sub.service_url);
      }
    }

    navigation.setOptions({
      title: isEditing ? t('credentials.edit') : t('credentials.add'),
    });
  }

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert(t('common.error'), t('credentials.username'));
      return;
    }
    if (!password && !isEditing) {
      Alert.alert(t('common.error'), t('credentials.password'));
      return;
    }

    try {
      if (isEditing && credentialId) {
        const existing = await getCredentialById(credentialId);
        if (existing && password) {
          await deletePassword(existing.encrypted_password_ref);
          const newRef = generateUUID();
          await storePassword(newRef, password);
          await updateCredential(credentialId, {
            service_url: serviceUrl.trim(),
            username: username.trim(),
            encrypted_password_ref: newRef,
          });
        } else {
          await updateCredential(credentialId, {
            service_url: serviceUrl.trim(),
            username: username.trim(),
          });
        }
      } else {
        const passwordRef = generateUUID();
        await storePassword(passwordRef, password);
        await createCredential({
          subscription_id: subscriptionId,
          service_url: serviceUrl.trim(),
          username: username.trim(),
          encrypted_password_ref: passwordRef,
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save credential:', error);
      Alert.alert(t('common.error'), String(error));
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>{t('credentials.serviceUrl')}</Text>
        <TextInput
          style={styles.input}
          value={serviceUrl}
          onChangeText={setServiceUrl}
          placeholder={t('credentials.urlPlaceholder')}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>{t('credentials.username')}</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder={t('credentials.usernamePlaceholder')}
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoComplete="username"
        />

        <Text style={styles.label}>{t('credentials.password')}</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={isEditing ? '(degistirmek icin girin)' : ''}
            placeholderTextColor={colors.textLight}
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.revealText}>
              {showPassword ? t('credentials.hide') : t('credentials.reveal')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('credentials.save')}</Text>
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
  passwordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  passwordInput: {
    flex: 1,
  },
  revealButton: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  revealText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
