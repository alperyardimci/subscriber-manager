export interface Subscription {
  id: string;
  name: string;
  service_url: string | null;
  billing_amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'custom';
  custom_cycle_days: number | null;
  next_payment_date: string;
  notification_advance_days: number;
  category: string | null;
  notes: string | null;
  last_notified_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  subscription_id: string;
  service_url: string;
  username: string;
  encrypted_password_ref: string;
  created_at: string;
  updated_at: string;
}

export type BillingCycle = 'monthly' | 'yearly' | 'custom';

export interface SubscriptionTemplate {
  id: string;
  nameKey: string;
  icon: string;
  brandColor: string;
  serviceUrl: string;
  category: string;
  defaultBillingCycle: 'monthly' | 'yearly';
}

export type RootStackParamList = {
  MainTabs: undefined;
  TemplatePicker: undefined;
  SubscriptionForm: { subscriptionId?: string; template?: SubscriptionTemplate } | undefined;
  SubscriptionDetail: { subscriptionId: string };
  CredentialForm: { subscriptionId: string; credentialId?: string };
};

export type MainTabParamList = {
  Subscriptions: undefined;
  Settings: undefined;
};
