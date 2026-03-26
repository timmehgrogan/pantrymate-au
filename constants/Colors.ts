/**
 * PantryMate AU colour palette.
 * Primary: Aussie bush green
 * Accent: Warm amber (pantry/food)
 */

const tintColorLight = '#2D6A4F';  // Deep forest green
const tintColorDark = '#52B788';   // Lighter green for dark mode

export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    // Category colours
    fridge: '#3B82F6',
    freezer: '#6366F1',
    pantry: '#F59E0B',
    // Status colours
    expirySoon: '#F59E0B',
    expired: '#EF4444',
    fresh: '#10B981',
    // Accent
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
    fridge: '#60A5FA',
    freezer: '#818CF8',
    pantry: '#FBBF24',
    expirySoon: '#FBBF24',
    expired: '#F87171',
    fresh: '#34D399',
    accent: '#FBBF24',
    accentLight: '#1F2937',
  },
};

export type ColorScheme = keyof typeof Colors;
