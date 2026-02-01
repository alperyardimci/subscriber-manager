import React, {useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList, SubscriptionTemplate} from '../../../lib/types';
import {colors, spacing, fontSize, borderRadius} from '../../../lib/theme';
import {SUBSCRIPTION_TEMPLATES} from '../data/templates';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_ORDER = ['video', 'music', 'cloud', 'ai', 'sports'];

export function TemplatePickerScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavProp>();

  const sections = useMemo(() => {
    const grouped: Record<string, SubscriptionTemplate[]> = {};
    for (const template of SUBSCRIPTION_TEMPLATES) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    return CATEGORY_ORDER
      .filter(cat => grouped[cat])
      .map(cat => ({
        title: t(`templates.categories.${cat}`),
        data: grouped[cat],
      }));
  }, [t]);

  function handleTemplatePress(template: SubscriptionTemplate) {
    navigation.navigate('SubscriptionForm', {template});
  }

  function handleManualAdd() {
    navigation.navigate('SubscriptionForm');
  }

  function renderGrid(items: SubscriptionTemplate[]) {
    const rows: SubscriptionTemplate[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map(item => (
          <View key={item.id} style={styles.gridItem}>
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => handleTemplatePress(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${t(item.nameKey)}, ${t(`templates.categories.${item.category}`)}`}>
              <Text style={styles.templateIcon}>{item.icon}</Text>
              <Text style={styles.templateName} numberOfLines={2}>
                {t(item.nameKey)}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {row.length < 3 &&
          Array.from({length: 3 - row.length}).map((_, i) => (
            <View key={`empty-${i}`} style={styles.gridItem} />
          ))}
      </View>
    ));
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.manualAddButton}
        onPress={handleManualAdd}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('templates.manualAdd')}>
        <Text style={styles.manualAddIcon}>{'✏️'}</Text>
        <Text style={styles.manualAddText}>{t('templates.manualAdd')}</Text>
      </TouchableOpacity>

      {sections.map(section => (
        <View key={section.title}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          {renderGrid(section.data)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  manualAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  manualAddIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  manualAddText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  templateName: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
