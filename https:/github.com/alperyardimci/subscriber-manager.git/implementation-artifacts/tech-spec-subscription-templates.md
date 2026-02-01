---
title: 'Subscription Templates - Popular Services'
slug: 'subscription-templates'
created: '2026-02-01'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React Native', 'TypeScript', 'React Navigation', 'react-i18next']
files_to_modify: ['src/lib/types.ts', 'src/navigation/AppNavigator.tsx', 'src/features/subscriptions/screens/SubscriptionFormScreen.tsx', 'src/features/subscriptions/screens/SubscriptionListScreen.tsx', 'src/i18n/tr.json', 'src/i18n/en.json']
files_to_create: ['src/features/subscriptions/data/templates.ts', 'src/features/subscriptions/screens/TemplatePickerScreen.tsx']
code_patterns: ['Feature-based folders', 'useTranslation hook', 'NativeStackNavigator', 'route.params for screen data', 'StyleSheet.create for styling', 'theme.ts constants']
test_patterns: ['Jest', '__tests__/ directory', '__mocks__/ for native modules', '@testing-library/react-native']
---

# Tech-Spec: Subscription Templates - Popular Services

**Created:** 2026-02-01

## Overview

### Problem Statement

Kullanicilar her abonelik eklerken tum bilgileri (isim, URL, kategori) manuel girmek zorunda kaliyor. Populer servisler icin bu tekrarlayan ve gereksiz bir is yukuyor.

### Solution

Turkiye'deki populer abonelik servislerinin hazir sablonlarini iceren ayri bir secim ekrani (TemplatePickerScreen). Kullanici sablon sectiginde isim, URL, kategori, ikon otomatik doluyor; sadece fiyat ve odeme tarihi girmesi yetiyor.

### Scope

**In Scope:**
- Yeni TemplatePickerScreen -- populer servislerin grid gorunumu (ikon + isim)
- Sablon veri modeli: isim, service_url, kategori, ikon (emoji), varsayilan billing_cycle
- Turkiye'deki populer servisler: Netflix, Spotify, YouTube Premium, iCloud, Apple Music, Disney+, BluTV, Exxen, Amazon Prime, beIN Connect, Apple TV+, Tidal, ChatGPT Plus, Turkcell TV+, vb.
- SubscriptionFormScreen'e template verisiyle navigasyon (pre-fill)
- i18n destegi (TR/EN sablon isimleri)

**Out of Scope:**
- Fiyat otomatik doldurma (kullanici girecek)
- Uzak sunucudan sablon guncelleme
- Kullanici tarafindan ozel sablon olusturma
- Logo/ikon dosyasi indirme (emoji kullanilacak)

## Context for Development

### Codebase Patterns

- React Native CLI + TypeScript strict mode
- Feature-based folder structure: `src/features/<feature>/`
- React Navigation: `createNativeStackNavigator<RootStackParamList>()` with typed params
- i18n via `useTranslation()` hook, TR primary, EN fallback
- Styling via `StyleSheet.create` + `theme.ts` constants (`colors`, `spacing`, `fontSize`, `borderRadius`)
- Route params pattern: `route.params?.subscriptionId` with optional chaining
- State initialization via `useState` hooks in screen components

### Files to Reference

| File | Purpose | Modification |
| ---- | ------- | ------------ |
| `src/lib/types.ts:29-34` | `RootStackParamList` type -- add `TemplatePicker` route, extend `SubscriptionForm` params with `template` | MODIFY |
| `src/navigation/AppNavigator.tsx:57-79` | Stack navigator -- add `TemplatePicker` screen | MODIFY |
| `src/features/subscriptions/screens/SubscriptionFormScreen.tsx:27-45` | Form screen -- read `template` from route params, pre-fill state | MODIFY |
| `src/features/subscriptions/screens/SubscriptionListScreen.tsx:103-108` | FAB -- change navigation target to TemplatePicker | MODIFY |
| `src/i18n/tr.json` | Turkish translations -- add `templates` section | MODIFY |
| `src/i18n/en.json` | English translations -- add `templates` section | MODIFY |
| `src/features/subscriptions/data/templates.ts` | Static template data (new file) | CREATE |
| `src/features/subscriptions/screens/TemplatePickerScreen.tsx` | Template picker grid screen (new file) | CREATE |

### Technical Decisions

- Sablon verileri statik TS dosyasi olarak `src/features/subscriptions/data/templates.ts`'de saklanacak -- import edilebilir, type-safe
- Emoji ikon kullanilacak (asset yonetimi gereksiz, cross-platform uyumlu)
- Fiyat alani bos birakilacak -- kullanici girecek
- `SubscriptionForm` route params: `{ subscriptionId?: string; template?: SubscriptionTemplate }` -- template varsa pre-fill, subscriptionId varsa edit
- FAB'a basildiginda TemplatePicker acilacak. TemplatePicker'da "Manuel Ekle" secenegi ile bos form acilabilecek
- Kategoriler: Video, Muzik, Bulut, Yapay Zeka, Spor, Diger

## Implementation Plan

### Tasks

- [x] Task 1: Define `SubscriptionTemplate` type and update `RootStackParamList`
  - File: `src/lib/types.ts`
  - Action: Add `SubscriptionTemplate` interface with fields: `id: string`, `nameKey: string` (i18n key), `icon: string` (emoji), `service_url: string`, `category: string`, `default_billing_cycle: 'monthly' | 'yearly'`. Add `TemplatePicker: undefined` to `RootStackParamList`. Extend `SubscriptionForm` params to `{ subscriptionId?: string; template?: SubscriptionTemplate }`.
  - Notes: `nameKey` is the i18n translation key (e.g., `templates.netflix`), resolved at render time via `t()`.

- [x] Task 2: Create static template data file
  - File: `src/features/subscriptions/data/templates.ts` (CREATE)
  - Action: Export `SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[]` array with ~18 popular Turkish-market services grouped by category. Services: Netflix, Disney+, BluTV, Exxen, Amazon Prime Video, Apple TV+, Turkcell TV+, beIN Connect (Video); Spotify, Apple Music, YouTube Premium, Tidal (Muzik); iCloud, Google One (Bulut); ChatGPT Plus, Copilot Pro (Yapay Zeka); DAZN, beIN Connect Spor (Spor).
  - Notes: Each entry includes emoji icon, service URL, category, and default billing cycle. IDs should be stable string identifiers (e.g., `netflix`, `spotify`).

- [x] Task 3: Add i18n translations for template names and screen labels
  - File: `src/i18n/tr.json` and `src/i18n/en.json`
  - Action: Add `templates` section with keys for each service name (e.g., `templates.netflix: "Netflix"`, `templates.spotify: "Spotify"`). Add screen labels: `templates.title` ("Populer Servisler" / "Popular Services"), `templates.manualAdd` ("Manuel Ekle" / "Add Manually"), `templates.selectTemplate` ("Sablon Sec" / "Choose Template"), category labels under `templates.categories.*`.
  - Notes: Most service names are identical in TR/EN but some may differ (e.g., category labels).

- [x] Task 4: Create `TemplatePickerScreen` component
  - File: `src/features/subscriptions/screens/TemplatePickerScreen.tsx` (CREATE)
  - Action: Create a screen with a `FlatList` or `ScrollView` displaying templates in a grid layout (3 columns). Each item shows emoji icon + service name. Group by category with section headers. Include a "Manuel Ekle" button at the top or bottom that navigates to `SubscriptionForm` with no template. On template press, navigate to `SubscriptionForm` with `{ template: selectedTemplate }`.
  - Notes: Use `useTranslation()` for all labels. Use `theme.ts` constants for styling. Use `NativeStackScreenProps<RootStackParamList, 'TemplatePicker'>` for typed props. Style: cards with rounded corners, category headers, grid gap via `columnWrapperStyle`.

- [x] Task 5: Register `TemplatePickerScreen` in navigation stack
  - File: `src/navigation/AppNavigator.tsx`
  - Action: Import `TemplatePickerScreen`. Add `<Stack.Screen name="TemplatePicker" component={TemplatePickerScreen} options={{ title: t('templates.title') }} />` inside the Stack.Navigator, between `MainTabs` and `SubscriptionForm`.
  - Notes: Screen title should use i18n translation.

- [x] Task 6: Update `SubscriptionFormScreen` to accept and pre-fill template data
  - File: `src/features/subscriptions/screens/SubscriptionFormScreen.tsx`
  - Action: Read `route.params?.template` in the component. If template is present (and no `subscriptionId`), pre-fill `useState` hooks: `name` from `t(template.nameKey)`, `serviceUrl` from `template.service_url`, `category` from `template.category`, `billingCycle` from `template.default_billing_cycle`. Leave `billingAmount`, `nextPaymentDate` empty for user input.
  - Notes: Template pre-fill should run once on mount (not on re-render). Use a `useEffect` or initial state pattern. Existing edit flow (`subscriptionId`) must not break.

- [x] Task 7: Update FAB in `SubscriptionListScreen` to navigate to `TemplatePicker`
  - File: `src/features/subscriptions/screens/SubscriptionListScreen.tsx`
  - Action: Change FAB `onPress` handler from `navigation.navigate('SubscriptionForm')` to `navigation.navigate('TemplatePicker')`.
  - Notes: Single line change. The "Manuel Ekle" option in TemplatePicker provides the path to the empty form.

- [x] Task 8: Add unit tests for template feature
  - File: `__tests__/templates.test.ts` (CREATE)
  - Action: Test that `SUBSCRIPTION_TEMPLATES` array has expected length, all entries have required fields (`id`, `nameKey`, `icon`, `service_url`, `category`, `default_billing_cycle`), no duplicate IDs, and all `nameKey` values follow `templates.*` pattern.
  - Notes: Simple data validation tests. No need to test UI rendering in this task (covered by manual testing and AC).

### Acceptance Criteria

- [x] AC 1: Given the user is on the subscription list screen, when they press the FAB (+) button, then the TemplatePicker screen opens (not the empty form).
- [x] AC 2: Given the user is on the TemplatePicker screen, when they see the grid, then popular Turkish-market services are displayed with emoji icons and names grouped by category (Video, Muzik, Bulut, Yapay Zeka, Spor).
- [x] AC 3: Given the user is on the TemplatePicker screen, when they tap a service template (e.g., Netflix), then the SubscriptionForm opens with name, service URL, category, and billing cycle pre-filled from the template.
- [x] AC 4: Given the user arrived at SubscriptionForm via a template, when the form loads, then the billing amount and next payment date fields are empty (user must fill these).
- [x] AC 5: Given the user is on the TemplatePicker screen, when they tap "Manuel Ekle", then the SubscriptionForm opens with all fields empty (standard add flow).
- [x] AC 6: Given the user edits an existing subscription (via detail screen), when the SubscriptionForm opens, then the edit flow works unchanged (no template interference).
- [x] AC 7: Given the app language is Turkish, when the TemplatePicker screen loads, then all labels (screen title, category headers, "Manuel Ekle" button) are displayed in Turkish.
- [x] AC 8: Given the app language is English, when the TemplatePicker screen loads, then all labels are displayed in English.
- [x] AC 9: Given the template data file, when imported, then all templates have valid `id`, `nameKey`, `icon`, `service_url`, `category`, and `default_billing_cycle` fields with no duplicate IDs.
- [x] AC 10: Given the user completes the subscription form (pre-filled via template), when they save, then the subscription is created in the database with the correct values.

## Additional Context

### Dependencies

- No new external libraries required. All functionality uses existing dependencies:
  - `@react-navigation/native-stack` (already installed) -- navigation
  - `react-i18next` (already installed) -- translations
  - `react-native` core components (`FlatList`, `TouchableOpacity`, `View`, `Text`) -- UI
- Depends on existing working subscription form and navigation infrastructure (Phase 1 complete)

### Testing Strategy

**Unit Tests:**
- `__tests__/templates.test.ts` -- Validate template data integrity (required fields, no duplicates, nameKey format)

**Manual Testing:**
- FAB navigates to TemplatePicker (not form)
- Template grid renders with icons, names, and category headers
- Tapping a template pre-fills the form correctly
- "Manuel Ekle" opens empty form
- Saving a template-based subscription works end-to-end
- Edit flow unaffected (navigate from detail screen)
- Language switching (TR/EN) updates all labels
- iOS and Android rendering (emoji cross-platform)

**Not Required (Out of Scope):**
- Snapshot tests for TemplatePickerScreen (overkill for static grid)
- E2E tests (no E2E framework set up)

### Notes

- Mevcut SubscriptionFormScreen zaten add/edit icin calisyor, template secimi sadece pre-fill ekliyor
- Emoji ikonlar cross-platform uyumlu (iOS + Android)
- TemplatePicker'da arama/filtreleme ilk iterasyonda gereksiz (15-20 sablon yeterli)
- Template verileri statik oldugu icin versiyonlama veya migration gereksiz
- Gelecekte: arama, favori sablonlar, kullanici ozel sablonlari eklenebilir (out of scope)

## Review Notes
- Adversarial review completed
- Findings: 14 total, 4 fixed, 10 skipped (noise/undecided)
- Resolution approach: auto-fix
- F1 Fixed: snake_case renamed to camelCase (serviceUrl, defaultBillingCycle)
- F4 Fixed: Added useEffect to reset form fields on template param change
- F5 Fixed: Replaced SectionList renderItem null hack with ScrollView
- F8 Fixed: Added accessibilityRole and accessibilityLabel to template cards and manual add button
