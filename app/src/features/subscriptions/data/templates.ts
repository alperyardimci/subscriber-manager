import type {SubscriptionTemplate} from '../../../lib/types';

export const SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[] = [
  // Video
  {
    id: 'netflix',
    nameKey: 'templates.netflix',
    icon: '🎬',
    serviceUrl: 'https://netflix.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'disney_plus',
    nameKey: 'templates.disneyPlus',
    icon: '🏰',
    serviceUrl: 'https://disneyplus.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'blutv',
    nameKey: 'templates.bluTV',
    icon: '📺',
    serviceUrl: 'https://blutv.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'exxen',
    nameKey: 'templates.exxen',
    icon: '📡',
    serviceUrl: 'https://exxen.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'amazon_prime_video',
    nameKey: 'templates.amazonPrimeVideo',
    icon: '📦',
    serviceUrl: 'https://primevideo.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'apple_tv_plus',
    nameKey: 'templates.appleTVPlus',
    icon: '🍎',
    serviceUrl: 'https://tv.apple.com',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'turkcell_tv_plus',
    nameKey: 'templates.turkcellTVPlus',
    icon: '📱',
    serviceUrl: 'https://tvplus.com.tr',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'bein_connect',
    nameKey: 'templates.beinConnect',
    icon: '⚽',
    serviceUrl: 'https://beinconnect.tv',
    category: 'video',
    defaultBillingCycle: 'monthly',
  },

  // Muzik
  {
    id: 'spotify',
    nameKey: 'templates.spotify',
    icon: '🎵',
    serviceUrl: 'https://spotify.com',
    category: 'music',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'apple_music',
    nameKey: 'templates.appleMusic',
    icon: '🎧',
    serviceUrl: 'https://music.apple.com',
    category: 'music',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'youtube_premium',
    nameKey: 'templates.youtubePremium',
    icon: '▶️',
    serviceUrl: 'https://youtube.com/premium',
    category: 'music',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'tidal',
    nameKey: 'templates.tidal',
    icon: '🌊',
    serviceUrl: 'https://tidal.com',
    category: 'music',
    defaultBillingCycle: 'monthly',
  },

  // Bulut
  {
    id: 'icloud',
    nameKey: 'templates.iCloud',
    icon: '☁️',
    serviceUrl: 'https://icloud.com',
    category: 'cloud',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'google_one',
    nameKey: 'templates.googleOne',
    icon: '🔵',
    serviceUrl: 'https://one.google.com',
    category: 'cloud',
    defaultBillingCycle: 'monthly',
  },

  // Yapay Zeka
  {
    id: 'chatgpt_plus',
    nameKey: 'templates.chatGPTPlus',
    icon: '🤖',
    serviceUrl: 'https://chat.openai.com',
    category: 'ai',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'copilot_pro',
    nameKey: 'templates.copilotPro',
    icon: '✈️',
    serviceUrl: 'https://copilot.microsoft.com',
    category: 'ai',
    defaultBillingCycle: 'monthly',
  },

  // Spor
  {
    id: 'dazn',
    nameKey: 'templates.dazn',
    icon: '🏟️',
    serviceUrl: 'https://dazn.com',
    category: 'sports',
    defaultBillingCycle: 'monthly',
  },
  {
    id: 'bein_connect_spor',
    nameKey: 'templates.beinConnectSpor',
    icon: '🏆',
    serviceUrl: 'https://beinconnect.tv',
    category: 'sports',
    defaultBillingCycle: 'monthly',
  },
];
