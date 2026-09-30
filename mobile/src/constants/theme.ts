export const COLORS = {
  // Backgrounds
  background: '#0B0B0E',
  surface: '#13131A',
  surfaceElevated: '#1B1B24',
  surfaceHover: '#232330',

  // Brand Primaries
  primary: '#E50914', // Fast Man Racing Crimson Red
  primaryDark: '#B91C1C',
  primaryLight: '#EF4444',
  primaryGlow: 'rgba(229, 9, 20, 0.25)',

  // Neutrals
  white: '#FFFFFF',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#242430',
  borderLight: '#323242',

  // Statuses
  success: '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.2)',
  warning: '#F59E0B',
  warningGlow: 'rgba(245, 158, 11, 0.2)',
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.2)',
  info: '#3B82F6',

  // Accents
  motorcycleBlack: '#050507',
  goldAccent: '#FBBF24',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
    elevation: 5,
  },
  glow: {
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
};
