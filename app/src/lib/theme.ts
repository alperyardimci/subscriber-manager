export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#333333',
  borderLight: '#444444',

  primary: '#00D4AA',
  primaryDark: '#00B893',
  primaryMuted: '#00D4AA26',

  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',

  error: '#FF4757',
  success: '#2ED573',
  warning: '#FFA502',
  danger: '#FF4757',

  categoryVideo: '#FF6B6B',
  categoryMusic: '#51CF66',
  categoryCloud: '#339AF0',
  categoryAI: '#CC5DE8',
  categorySports: '#FF922B',
  categoryProductivity: '#F59F00',
  categoryGaming: '#F06595',
  categoryEducation: '#20C997',
  categoryNews: '#FCC419',
} as const;

const categoryColorMap: Record<string, string> = {
  video: colors.categoryVideo,
  music: colors.categoryMusic,
  cloud: colors.categoryCloud,
  ai: colors.categoryAI,
  sports: colors.categorySports,
  productivity: colors.categoryProductivity,
  gaming: colors.categoryGaming,
  education: colors.categoryEducation,
  news: colors.categoryNews,
};

export function categoryColor(category: string): string {
  return categoryColorMap[category.toLowerCase()] || colors.primary;
}

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
