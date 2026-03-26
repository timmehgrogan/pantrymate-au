/**
 * PantryMate AU colour palette — matches design mockups.
 * Primary: Sage green (#5B7A5A)
 * Accent: Warm amber (#C4A352) for Barcode Scan button
 */

export const Colors = {
  light: {
    text: '#1C2B1C',
    textSecondary: '#6B7280',
    background: '#F5F5F0',
    surface: '#FFFFFF',
    tint: '#5B7A5A',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FFFFFF',
    tabActiveBackground: '#3A5A38',
    border: '#E4E9E4',
    shadow: 'rgba(0,0,0,0.07)',
    // Category colours
    fridge: '#3B82F6',
    freezer: '#6366F1',
    pantry: '#5B7A5A',
    // Status colours
    expirySoon: '#E8A020',
    expired: '#DC2626',
    fresh: '#5B7A5A',
    // Accent (amber for scan button)
    accent: '#C4A352',
    accentDark: '#A8892A',
    accentLight: '#FEF3C7',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9CA3AF',
    background: '#111A11',
    surface: '#1C2A1C',
    tint: '#7AAB7A',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FFFFFF',
    tabActiveBackground: '#3A5A38',
    border: '#2A3A2A',
    shadow: 'rgba(0,0,0,0.3)',
    fridge: '#60A5FA',
    freezer: '#818CF8',
    pantry: '#7AAB7A',
    expirySoon: '#FBBF24',
    expired: '#F87171',
    fresh: '#7AAB7A',
    accent: '#D4B362',
    accentDark: '#B8972A',
    accentLight: '#2A2A1A',
  },
};

export type ColorScheme = keyof typeof Colors;
