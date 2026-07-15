import { ReactNode } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/colors';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  padded?: boolean;
};

export default function ScreenContainer({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  style,
  padded = true,
}: Props) {
  const body = (
    <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientMid, colors.gradientBottom]}
      locations={[0, 0.45, 1]}
      style={styles.flex}
    >
      <View pointerEvents="none" style={styles.orbWrap}>
        <View style={[styles.orb, styles.orbOne]} />
        <View style={[styles.orb, styles.orbTwo]} />
        <View style={[styles.orb, styles.orbThree]} />
      </View>

      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.brandTitle}
                />
              ) : undefined
            }
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

export function ScreenLoader() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.brandTitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  inner: { flexGrow: 1 },
  padded: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  orbWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 220,
    height: 220,
    top: -40,
    right: -50,
    backgroundColor: colors.orbGold,
  },
  orbTwo: {
    width: 180,
    height: 180,
    top: 160,
    left: -70,
    backgroundColor: colors.orbCream,
  },
  orbThree: {
    width: 260,
    height: 260,
    bottom: 40,
    right: -80,
    backgroundColor: colors.orbAmber,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});
