import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

type IconProps = {
  size?: number;
};

/** BIS hallmark style — gold shield */
export function ShieldIcon({ size = 44 }: IconProps) {
  return (
    <MaterialCommunityIcons
      name="shield-check-outline"
      size={size}
      color={colors.gold}
    />
  );
}

/** Brilliant-cut diamond */
export function DiamondIcon({ size = 44 }: IconProps) {
  return (
    <MaterialCommunityIcons
      name="diamond-stone"
      size={size}
      color={colors.gold}
    />
  );
}

/** Trust seal / medal */
export function BadgeIcon({ size = 44 }: IconProps) {
  return (
    <MaterialCommunityIcons
      name="medal-outline"
      size={size}
      color={colors.gold}
    />
  );
}

/** Small diamond used in dividers */
export function TinyDiamond({ size = 10 }: IconProps) {
  return (
    <View
      style={[
        styles.tinyDiamond,
        {
          width: size,
          height: size,
          borderRadius: 1,
          backgroundColor: colors.gold,
        },
      ]}
    />
  );
}

export const SPLASH_ICONS = {
  shield: ShieldIcon,
  diamond: DiamondIcon,
  badge: BadgeIcon,
} as const;

const styles = StyleSheet.create({
  tinyDiamond: {
    transform: [{ rotate: '45deg' }],
  },
});
