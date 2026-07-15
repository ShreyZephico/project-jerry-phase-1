/**
 * App theme — gold jewellery fintech + colorful UX boxes.
 * Change here; shared UI updates everywhere.
 */
export const colors = {
  gold: '#C5A059',
  goldDark: '#9A7B2F',
  goldLight: '#E8D48B',
  goldSoft: 'rgba(197, 160, 89, 0.22)',
  brandTitle: '#8B6914',
  brandSubtitle: '#9A7B2F',

  cream: '#F5EBD8',
  white: '#FFFFFF',
  black: '#000000',
  surface: '#FFFDF8',
  surfaceMuted: '#F8F1E3',
  border: 'rgba(212, 183, 106, 0.45)',
  borderStrong: 'rgba(197, 160, 89, 0.65)',

  gradientTop: '#FFFBF5',
  gradientMid: '#F3E4C8',
  gradientBottom: '#E2C98A',
  orbGold: 'rgba(232, 212, 139, 0.55)',
  orbCream: 'rgba(255, 253, 248, 0.7)',
  orbAmber: 'rgba(197, 160, 89, 0.28)',

  textPrimary: '#B8962E',
  textSecondary: '#A8893A',
  textMuted: '#8B7435',
  textBody: '#5C4A24',
  textStrong: '#3D2E12',

  success: '#2F6B3A',
  successSoft: 'rgba(47, 107, 58, 0.14)',
  warning: '#B7770D',
  warningSoft: 'rgba(183, 119, 13, 0.14)',
  danger: '#A33B2B',
  dangerSoft: 'rgba(163, 59, 43, 0.14)',
  info: '#3B5B8A',
  infoSoft: 'rgba(59, 91, 138, 0.14)',

  /** Colorful metric / feature boxes */
  boxGoldBg: '#F4E3B8',
  boxGoldBorder: '#D4A84B',
  boxGoldAccent: '#B8860B',
  boxSilverBg: '#E8EEF5',
  boxSilverBorder: '#8FA3BE',
  boxSilverAccent: '#4A6790',
  boxGreenBg: '#E4F2E7',
  boxGreenBorder: '#6FA87B',
  boxGreenAccent: '#2F6B3A',
  boxBlueBg: '#E6EEF8',
  boxBlueBorder: '#7A99C4',
  boxBlueAccent: '#3B5B8A',
  boxAmberBg: '#F8E9D4',
  boxAmberBorder: '#D4A06A',
  boxAmberAccent: '#A65F1F',
  boxRoseBg: '#F7E8E5',
  boxRoseBorder: '#C4897E',
  boxRoseAccent: '#A34B3D',
  boxTealBg: '#E3F3F1',
  boxTealBorder: '#6FB0A8',
  boxTealAccent: '#2F6F68',
  boxPurpleBg: '#EEE8F5',
  boxPurpleBorder: '#9B86B8',
  boxPurpleAccent: '#5C4A7A',

  progressTrack: 'rgba(197, 160, 89, 0.22)',
  progressFill: '#C5A059',
  progressBorder: '#C5A059',

  glassFill: 'rgba(255, 253, 248, 0.42)',
  glassFillStrong: 'rgba(255, 253, 248, 0.62)',
  glassBorder: 'rgba(255, 255, 255, 0.55)',
  glassHighlight: 'rgba(255, 255, 255, 0.75)',
  glassTint: 'rgba(232, 212, 139, 0.12)',

  inputBg: 'rgba(255, 255, 255, 0.72)',
  inputBorder: 'rgba(212, 183, 106, 0.55)',
  inputText: '#5C4A24',
  placeholder: '#A8893A',
  buttonBg: '#8B6914',
  buttonText: '#FFFFFF',
  buttonSecondaryBg: 'rgba(255, 253, 248, 0.45)',
  buttonSecondaryBorder: 'rgba(139, 105, 20, 0.55)',
  buttonSecondaryText: '#8B6914',
  overlay: 'rgba(61, 46, 18, 0.45)',
  cardShadow: 'rgba(139, 105, 20, 0.18)',
  tabBarGlass: 'rgba(255, 253, 248, 0.78)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const glass = {
  intensity: 48,
  intensityStrong: 62,
  intensityTab: 70,
  tint: 'systemThinMaterialLight' as const,
};

export type ColorTone =
  | 'gold'
  | 'silver'
  | 'green'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'purple';

export function getTonePalette(tone: ColorTone) {
  switch (tone) {
    case 'silver':
      return {
        bg: colors.boxSilverBg,
        border: colors.boxSilverBorder,
        accent: colors.boxSilverAccent,
      };
    case 'green':
      return {
        bg: colors.boxGreenBg,
        border: colors.boxGreenBorder,
        accent: colors.boxGreenAccent,
      };
    case 'blue':
      return {
        bg: colors.boxBlueBg,
        border: colors.boxBlueBorder,
        accent: colors.boxBlueAccent,
      };
    case 'amber':
      return {
        bg: colors.boxAmberBg,
        border: colors.boxAmberBorder,
        accent: colors.boxAmberAccent,
      };
    case 'rose':
      return {
        bg: colors.boxRoseBg,
        border: colors.boxRoseBorder,
        accent: colors.boxRoseAccent,
      };
    case 'teal':
      return {
        bg: colors.boxTealBg,
        border: colors.boxTealBorder,
        accent: colors.boxTealAccent,
      };
    case 'purple':
      return {
        bg: colors.boxPurpleBg,
        border: colors.boxPurpleBorder,
        accent: colors.boxPurpleAccent,
      };
    case 'gold':
    default:
      return {
        bg: colors.boxGoldBg,
        border: colors.boxGoldBorder,
        accent: colors.boxGoldAccent,
      };
  }
}
