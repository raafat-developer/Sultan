export const LIGHT_COLORS = {
  // Backgrounds
  background: '#F8FAFC', // Slate 50 clean light background
  surface: '#FFFFFF',     // Pure white card surfaces
  surfaceElevated: '#F1F5F9', // Slate 100 elevated sections
  surfaceHover: '#E2E8F0',

  // Brand Primaries
  primary: '#E50914', // Fast Man Racing Crimson Red
  primaryDark: '#B91C1C',
  primaryLight: '#EF4444',
  primaryGlow: 'rgba(229, 9, 20, 0.12)',

  // Neutrals
  white: '#FFFFFF',
  text: '#0F172A',        // Slate 900 primary high contrast
  textSecondary: '#334155', // Slate 700
  textMuted: '#64748B',     // Slate 500
  border: '#E2E8F0',        // Slate 200 clean border
  borderLight: '#CBD5E1',

  // Statuses
  success: '#059669',
  successGlow: 'rgba(5, 150, 105, 0.12)',
  warning: '#D97706',
  warningGlow: 'rgba(217, 119, 6, 0.12)',
  danger: '#DC2626',
  dangerGlow: 'rgba(220, 38, 38, 0.12)',
  info: '#2563EB',

  // Accents
  motorcycleBlack: '#0F172A',
  goldAccent: '#D97706',
};

export const DARK_COLORS = {
  // Backgrounds
  background: '#0B0B0E',
  surface: '#13131A',
  surfaceElevated: '#1B1B24',
  surfaceHover: '#232330',

  // Brand Primaries
  primary: '#E50914',
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

// LIGHT THEME IS DEFAULT AS REQUESTED BY USER
export const COLORS = LIGHT_COLORS;

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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  glow: {
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};
