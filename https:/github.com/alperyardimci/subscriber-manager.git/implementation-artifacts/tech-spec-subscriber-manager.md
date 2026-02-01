---
title: 'Subscriber Manager'
slug: 'subscriber-manager'
created: '2026-02-01'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['React Native', 'TypeScript', 'SQLite + SQLCipher', 'iOS Keychain', 'Android Keystore', 'Local Scheduled Notifications']
files_to_modify: []
code_patterns: ['Greenfield - React Native CLI or Expo project structure to be established']
test_patterns: ['Jest (React Native default)', 'React Native Testing Library']
---

# Tech-Spec: Subscriber Manager

**Created:** 2026-02-01

## Overview

### Problem Statement

Users lose track of recurring subscriptions (Netflix, Spotify, iCloud, etc.), forget payment dates, continue paying for unused services, and struggle to manage credentials across multiple platforms. There is no single local-first app that combines subscription tracking, payment reminders, and credential management with system-level AutoFill.

### Solution

A cross-platform mobile application (iOS + Android) built with React Native that allows users to manage all their subscriptions in one place. The app tracks payment cycles (monthly, yearly, custom), sends configurable local push notifications before payment dates (default: 2 days), and securely stores credentials with native OS-level AutoFill integration (iOS AutoFill Credential Provider Extension + Android Autofill Framework). All data is stored locally on-device using SQLite + SQLCipher for encryption.

### Scope

**In Scope:**
- Subscription CRUD (add, edit, delete) with support for monthly, yearly, and custom billing cycles
- Local scheduled push notification reminders with user-configurable advance notice (default: 2 days before payment)
- Secure credential storage (encrypted, on-device)
- iOS AutoFill Credential Provider Extension integration
- Android Autofill Framework integration
- Local-only data storage (SQLite + SQLCipher, on-device, no cloud)
- Cross-platform: iOS + Android via React Native

**Out of Scope:**
- Cloud synchronization / multi-device sync
- Web application
- Payment processing
- In-app browser (WebView) auto-fill
- Subscription price fetching (deferred to future iteration)

## Context for Development

### Codebase Patterns

Confirmed Clean Slate — greenfield project. Conventions to establish:
- React Native CLI project with TypeScript strict mode
- Feature-based folder structure: `src/features/<feature>/`
- Shared utilities in `src/lib/`
- Navigation in `src/navigation/`
- Database layer in `src/db/`
- i18n files in `src/i18n/`
- Native modules in `ios/` and `android/` for AutoFill extensions

### Files to Reference

| File | Purpose |
| ---- | ------- |

No existing files — greenfield project. All files to be created.

### Technical Decisions

- **Cross-platform framework:** React Native with TypeScript (CLI, not Expo — native modules required for AutoFill)
- **Local storage:** SQLite + SQLCipher for encrypted on-device database via `react-native-quick-sqlite` or `react-native-sqlite-storage`
- **Credential encryption:** iOS Keychain + Android Keystore via `react-native-keychain`
- **AutoFill integration:** iOS AutoFill Credential Provider Extension (native Swift) + Android Autofill Framework (native Kotlin) — bridged to React Native
- **Push notifications:** Local scheduled notifications via `notifee` (maintained, supports scheduled/repeating)
- **Navigation:** React Navigation (stack + bottom tabs)
- **State management:** React Context + useReducer (no Redux needed for local-only app)
- **i18n:** `react-native-i18next` with Turkish as primary language
- **Price fetching:** Out of scope for initial release

## Implementation Plan

### Tasks

#### Phase 1: Project Foundation

- [ ] Task 1: Initialize React Native CLI project with TypeScript
  - File: `./` (project root)
  - Action: Run `npx react-native init SubscriberManager --template react-native-template-typescript`, configure `tsconfig.json` with strict mode, set up `.editorconfig` and `.prettierrc`
  - Notes: Use React Native CLI (not Expo) because AutoFill extensions require native module access

- [ ] Task 2: Set up project folder structure
  - File: `src/`
  - Action: Create directory structure:
    - `src/features/subscriptions/` — subscription screens and components
    - `src/features/credentials/` — credential screens and components
    - `src/features/notifications/` — notification logic and settings
    - `src/features/settings/` — app settings screen
    - `src/db/` — database schema, migrations, repository layer
    - `src/lib/` — shared utilities, types, constants
    - `src/navigation/` — React Navigation setup
    - `src/i18n/` — localization files
  - Notes: Feature-based structure keeps related code co-located

- [ ] Task 3: Set up React Navigation
  - File: `src/navigation/AppNavigator.tsx`
  - Action: Install `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`. Create bottom tab navigator with: Subscriptions (home), Settings. Create stack navigators within each tab for detail/form screens.
  - Notes: Bottom tabs for main sections, stack navigator for drill-down flows

- [ ] Task 4: Set up SQLite + SQLCipher database layer
  - File: `src/db/database.ts`, `src/db/migrations.ts`
  - Action: Install `react-native-quick-sqlite` (or `react-native-sqlite-storage` with SQLCipher). Create database initialization function with encryption key derived from device secure storage. Create migration system for schema versioning.
  - Notes: Encryption key stored in iOS Keychain / Android Keystore via `react-native-keychain`. Migration system needed for future schema updates.

- [ ] Task 5: Set up i18n with Turkish as primary language
  - File: `src/i18n/index.ts`, `src/i18n/tr.json`, `src/i18n/en.json`
  - Action: Install `i18next`, `react-i18next`. Configure with Turkish (`tr`) as default language and English (`en`) as fallback. Create translation JSON files with initial keys for common UI elements.
  - Notes: All user-facing strings must go through i18n

#### Phase 2: Subscription Management (Core Feature)

- [ ] Task 6: Create subscription database schema and repository
  - File: `src/db/schema.sql`, `src/db/repositories/subscriptionRepository.ts`
  - Action: Define `subscriptions` table: `id` (UUID), `name` (TEXT), `service_url` (TEXT, nullable), `billing_amount` (REAL), `currency` (TEXT, default 'TRY'), `billing_cycle` (TEXT: 'monthly'|'yearly'|'custom'), `custom_cycle_days` (INTEGER, nullable), `next_payment_date` (TEXT, ISO date), `notification_advance_days` (INTEGER, default 2), `category` (TEXT, nullable), `notes` (TEXT, nullable), `created_at` (TEXT), `updated_at` (TEXT). Create repository with CRUD functions: `getAll()`, `getById(id)`, `create(sub)`, `update(id, sub)`, `delete(id)`, `getUpcoming(days)`.
  - Notes: UUID for IDs (no auto-increment — future-proof for potential sync). ISO date strings for date fields.

- [ ] Task 7: Build subscription list screen (Home)
  - File: `src/features/subscriptions/screens/SubscriptionListScreen.tsx`, `src/features/subscriptions/components/SubscriptionCard.tsx`
  - Action: Create home screen showing all subscriptions as a scrollable list. Each card shows: service name, next payment date, amount, billing cycle badge. Sort by next payment date (soonest first). Add FAB (floating action button) to add new subscription. Show monthly/yearly total spend summary at top.
  - Notes: Use FlatList for performance. Empty state with illustration and "Add your first subscription" CTA.

- [ ] Task 8: Build add/edit subscription form
  - File: `src/features/subscriptions/screens/SubscriptionFormScreen.tsx`
  - Action: Create form with fields: name (required), service URL (optional), amount (required, numeric), currency (picker, default TRY), billing cycle (segmented control: monthly/yearly/custom), custom cycle days (conditional, shown only for custom), next payment date (date picker), notification advance days (number input, default 2), category (optional picker), notes (optional multiline). Validate required fields. Save via repository. On save, schedule notification (Task 12).
  - Notes: Same screen for add and edit — populate fields when editing. Use React Hook Form or Formik for form state.

- [ ] Task 9: Build subscription detail screen
  - File: `src/features/subscriptions/screens/SubscriptionDetailScreen.tsx`
  - Action: Show full subscription details. Include edit button (navigates to form), delete button (with confirmation alert). Show linked credentials section (from Task 15). Show payment history summary (calculated from billing cycle and start date).
  - Notes: Delete triggers notification cancellation (Task 12) and credential cleanup.

#### Phase 3: Notification System

- [ ] Task 10: Set up local notification infrastructure
  - File: `src/features/notifications/notificationService.ts`
  - Action: Install `@notifee/react-native`. Create notification service with: `requestPermissions()`, `scheduleNotification(subscriptionId, date, title, body)`, `cancelNotification(subscriptionId)`, `cancelAllNotifications()`. Configure notification channel for Android (name: "Payment Reminders", importance: high).
  - Notes: `notifee` supports exact scheduling and repeating triggers. iOS requires permission request on first use.

- [ ] Task 11: Implement notification scheduling logic
  - File: `src/features/notifications/notificationScheduler.ts`
  - Action: Create scheduler that: calculates next notification date from `next_payment_date - notification_advance_days`, schedules a local notification at that date, after notification fires or payment date passes, auto-calculates next cycle date and reschedules. Handle all billing cycle types (monthly: add 1 month, yearly: add 1 year, custom: add N days).
  - Notes: Run rescheduling on app launch to catch any missed cycles. Use `notifee` trigger timestamps.

- [ ] Task 12: Build notification settings in app settings
  - File: `src/features/settings/screens/SettingsScreen.tsx`
  - Action: Add notification section to settings: global toggle (enable/disable all reminders), default advance notice days (applies to new subscriptions). Show notification permission status with button to open OS settings if denied.
  - Notes: Per-subscription override is on the subscription form (Task 8).

#### Phase 4: Credential Management

- [ ] Task 13: Create credential database schema and secure storage layer
  - File: `src/db/repositories/credentialRepository.ts`, `src/lib/secureStorage.ts`
  - Action: Define `credentials` table: `id` (UUID), `subscription_id` (TEXT, FK to subscriptions), `service_url` (TEXT), `username` (TEXT), `encrypted_password_ref` (TEXT — reference key to Keychain/Keystore entry), `created_at` (TEXT), `updated_at` (TEXT). Create `secureStorage.ts` wrapper around `react-native-keychain` for: `storePassword(key, password)`, `getPassword(key)`, `deletePassword(key)`. Actual passwords never stored in SQLite — only reference keys.
  - Notes: Password stored in OS secure storage (Keychain/Keystore), SQLite only holds the reference key. This separation is critical for security.

- [ ] Task 14: Build credential add/edit form
  - File: `src/features/credentials/screens/CredentialFormScreen.tsx`
  - Action: Create form with: service URL (pre-filled from subscription if linked), username/email (required), password (required, masked input with reveal toggle). On save: store password in secure storage via `secureStorage.storePassword()`, store reference key in SQLite via repository. Accessible from subscription detail screen.
  - Notes: Password field should have generate button (nice-to-have, not required for MVP).

- [ ] Task 15: Build credential list and detail view
  - File: `src/features/credentials/screens/CredentialListScreen.tsx`, `src/features/credentials/components/CredentialCard.tsx`
  - Action: Show credentials linked to a subscription on the subscription detail screen. Each card shows: service URL, username, masked password with reveal button, copy-to-clipboard button for username and password. Standalone credential list accessible from navigation if needed.
  - Notes: Reveal requires biometric authentication (Face ID / fingerprint) via `react-native-keychain` biometric options.

#### Phase 5: AutoFill Integration (Native Modules)

- [ ] Task 16: Implement iOS AutoFill Credential Provider Extension
  - File: `ios/AutoFillExtension/CredentialProviderViewController.swift`, `ios/AutoFillExtension/Info.plist`
  - Action: Create iOS App Extension target (AutoFill Credential Provider). Implement `ASCredentialProviderViewController` subclass: `prepareCredentialList(for:)` — read credentials from shared Keychain access group, `provideCredential(for:)` — return selected credential. Configure shared Keychain access group between main app and extension. Add `ASCredentialProviderExtensionCapability` to extension's Info.plist.
  - Notes: Extension runs in separate process — cannot access React Native bridge. Must use shared Keychain access group. Requires Apple Developer account with proper entitlements.

- [ ] Task 17: Implement Android Autofill Framework service
  - File: `android/app/src/main/java/.../AutofillService.kt`, `android/app/src/main/res/xml/autofill_service.xml`
  - Action: Create `AutofillService` extending `android.service.autofill.AutofillService`. Implement `onFillRequest()`: query credential repository, build `FillResponse` with `Dataset` entries. Implement `onSaveRequest()` for capturing new credentials. Register service in `AndroidManifest.xml` with `android.permission.BIND_AUTOFILL_SERVICE`. Create service metadata XML.
  - Notes: Requires Android 8.0+ (API 26). User must enable the service in Android Settings > Autofill service.

- [ ] Task 18: Bridge native AutoFill modules to React Native
  - File: `src/lib/autofillBridge.ts`, `ios/AutoFillBridge.swift`, `android/.../AutofillBridgeModule.kt`
  - Action: Create React Native native module bridge for: `isAutoFillEnabled()` — check if extension/service is active, `openAutoFillSettings()` — deep link to OS settings to enable AutoFill. Expose via `NativeModules` in TypeScript wrapper. Add UI in settings screen to show AutoFill status and guide user to enable it.
  - Notes: The AutoFill extensions themselves run independently — bridge is only for status checking and settings navigation.

#### Phase 6: Polish & Settings

- [ ] Task 19: Complete settings screen
  - File: `src/features/settings/screens/SettingsScreen.tsx`
  - Action: Add remaining settings sections: Language selection (Turkish/English), AutoFill status and setup guide (from Task 18), About section (version, licenses), Data management (export/import as encrypted backup — nice-to-have).
  - Notes: Language switch triggers i18n locale change and re-render.

- [ ] Task 20: UI theming and visual polish
  - File: `src/lib/theme.ts`, `src/lib/components/`
  - Action: Create theme system with: color palette (light mode), typography scale, spacing constants, shared components (Button, Card, Input, Header). Apply consistent styling across all screens. Add app icon and splash screen.
  - Notes: Dark mode can be deferred to future iteration. Focus on clean, consistent light theme.

### Acceptance Criteria

#### Subscription Management
- [ ] AC 1: Given the app is launched, when the user views the home screen, then all subscriptions are listed sorted by next payment date (soonest first) with name, amount, cycle, and date visible.
- [ ] AC 2: Given the user taps the add button, when they fill in name, amount, cycle, and next payment date and tap save, then a new subscription is created and appears in the list.
- [ ] AC 3: Given a subscription exists, when the user edits any field and saves, then the changes are persisted and reflected in the list.
- [ ] AC 4: Given a subscription exists, when the user deletes it and confirms, then it is removed from the list, its notifications are cancelled, and linked credentials are deleted.
- [ ] AC 5: Given a subscription with custom billing cycle of 90 days, when the payment date passes, then the next payment date is correctly calculated as +90 days.

#### Notifications
- [ ] AC 6: Given a subscription with next payment on Feb 15 and advance notice of 2 days, when Feb 13 arrives, then a local push notification is displayed with the subscription name and payment amount.
- [ ] AC 7: Given notifications are disabled globally in settings, when a payment date approaches, then no notification is sent for any subscription.
- [ ] AC 8: Given a subscription is deleted, when its notification date arrives, then no notification is sent.

#### Credential Management
- [ ] AC 9: Given a subscription exists, when the user adds credentials (URL, username, password) linked to it, then the password is stored in OS secure storage (Keychain/Keystore) and only a reference key is stored in SQLite.
- [ ] AC 10: Given credentials exist, when the user taps reveal password, then biometric authentication (Face ID/fingerprint) is required before the password is shown.
- [ ] AC 11: Given credentials exist, when the user taps copy on username or password, then the value is copied to clipboard.

#### AutoFill
- [ ] AC 12: Given the iOS AutoFill extension is enabled and credentials are stored, when the user encounters a login field in Safari or another app, then matching credentials appear in the iOS AutoFill suggestion bar.
- [ ] AC 13: Given the Android Autofill service is enabled and credentials are stored, when the user encounters a login field in Chrome or another app, then matching credentials appear in the Android autofill dropdown.
- [ ] AC 14: Given AutoFill is not enabled, when the user opens settings, then they see the current status and a button to navigate to OS AutoFill settings.

#### Data & Security
- [ ] AC 15: Given the app is installed, when the database is inspected directly on the filesystem, then all data is encrypted (SQLCipher) and unreadable without the key.
- [ ] AC 16: Given all data is local-only, when the device has no internet connection, then all app features work fully offline.

#### Localization
- [ ] AC 17: Given Turkish is set as the language, when the user navigates any screen, then all UI text is displayed in Turkish.

## Additional Context

### Dependencies

| Package | Purpose | Version Note |
| ------- | ------- | ------------ |
| `react-native` | Cross-platform framework | Latest stable (0.7x) |
| `typescript` | Type safety | ^5.x |
| `@react-navigation/native` | Navigation | ^6.x |
| `@react-navigation/bottom-tabs` | Tab navigation | ^6.x |
| `@react-navigation/native-stack` | Stack navigation | ^6.x |
| `react-native-quick-sqlite` | SQLite + SQLCipher | Check SQLCipher support |
| `react-native-keychain` | iOS Keychain + Android Keystore | Biometric support required |
| `@notifee/react-native` | Local push notifications | Scheduled triggers |
| `i18next` + `react-i18next` | Internationalization | Turkish + English |
| `react-native-safe-area-context` | Safe area handling | Required by React Navigation |
| `react-native-screens` | Native screen optimization | Required by React Navigation |

### Testing Strategy

**Unit Tests (Jest):**
- Subscription repository CRUD operations (mock SQLite)
- Notification scheduling date calculations (all cycle types: monthly, yearly, custom)
- Secure storage wrapper functions (mock Keychain)
- Currency formatting and date utilities

**Integration Tests (React Native Testing Library):**
- Subscription list renders correctly with mock data
- Add subscription form validates and saves
- Edit flow loads existing data and persists changes
- Delete flow shows confirmation and removes item
- Settings screen toggles work

**Manual Testing:**
- iOS AutoFill extension appears in Safari login fields
- Android Autofill service appears in Chrome login fields
- Biometric prompt appears when revealing passwords
- Notifications fire at correct times (test with short intervals)
- Database encryption verified by attempting raw file read

### Notes

- User skill level: intermediate
- All UI text must support Turkish localization as primary language
- Security is critical for credential storage — must use platform-native secure storage (Keychain/Keystore)
- AutoFill extensions require native platform code (Swift for iOS, Kotlin for Android) regardless of React Native
- No backend dependency — entire app is local-first
- React Native CLI (not Expo) is required because of native AutoFill extensions
- High-risk items: AutoFill extensions are the most complex feature — native iOS/Android code with shared storage. Consider implementing these last and shipping core features (subscription CRUD + notifications + credentials) first.
- SQLCipher encryption key management: the key itself must be stored in Keychain/Keystore, creating a circular dependency at first launch. Solution: generate key on first launch, store in secure storage, retrieve on subsequent launches.
