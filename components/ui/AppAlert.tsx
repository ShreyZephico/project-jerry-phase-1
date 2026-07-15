import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { colors, radius, spacing } from '@/constants/colors';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type AlertDetail = {
  label: string;
  value: string;
};

export type AlertAction = {
  label: string;
  onPress?: () => void;
};

export type AppAlertOptions = {
  type?: AlertType;
  title: string;
  message?: string;
  details?: AlertDetail[];
  primaryAction?: AlertAction;
  secondaryAction?: AlertAction;
};

type AlertContextValue = {
  showAlert: (options: AppAlertOptions) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const TYPE_META: Record<
  AlertType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    bg: string;
    border: string;
    accent: string;
  }
> = {
  success: {
    icon: 'checkmark-circle',
    bg: colors.boxGreenBg,
    border: colors.boxGreenBorder,
    accent: colors.boxGreenAccent,
  },
  error: {
    icon: 'close-circle',
    bg: colors.boxRoseBg,
    border: colors.boxRoseBorder,
    accent: colors.boxRoseAccent,
  },
  warning: {
    icon: 'warning',
    bg: colors.boxAmberBg,
    border: colors.boxAmberBorder,
    accent: colors.boxAmberAccent,
  },
  info: {
    icon: 'information-circle',
    bg: colors.boxBlueBg,
    border: colors.boxBlueBorder,
    accent: colors.boxBlueAccent,
  },
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AppAlertOptions | null>(null);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const showAlert = useCallback((next: AppAlertOptions) => {
    setOptions(next);
    setVisible(true);
  }, []);

  const value = useMemo(
    () => ({ showAlert, hideAlert }),
    [showAlert, hideAlert],
  );

  const type = options?.type ?? 'info';
  const meta = TYPE_META[type];

  function runAction(action?: AlertAction) {
    hideAlert();
    // Let modal close before navigation
    if (action?.onPress) {
      setTimeout(() => action.onPress?.(), 180);
    }
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <View style={styles.backdrop}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidDim]} />
          )}

          <Pressable style={StyleSheet.absoluteFill} onPress={hideAlert} />

          <View style={styles.cardWrap}>
            <View style={[styles.card, { borderColor: meta.border }]}>
              <View style={[styles.iconRing, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={42} color={meta.accent} />
              </View>

              <Text style={styles.title}>{options?.title}</Text>
              {options?.message ? (
                <Text style={styles.message}>{options.message}</Text>
              ) : null}

              {options?.details && options.details.length > 0 ? (
                <View style={styles.detailsBox}>
                  {options.details.map((row) => (
                    <View key={row.label} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.actions}>
                {options?.secondaryAction ? (
                  <Pressable
                    onPress={() => runAction(options.secondaryAction)}
                    style={({ pressed }) => [
                      styles.btnSecondary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.btnSecondaryText}>
                      {options.secondaryAction.label}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() =>
                    runAction(
                      options?.primaryAction ?? { label: 'OK', onPress: hideAlert },
                    )
                  }
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    { backgroundColor: meta.accent },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>
                    {options?.primaryAction?.label ?? 'OK'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAppAlert must be used inside AlertProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  androidDim: {
    backgroundColor: 'rgba(40, 28, 10, 0.55)',
  },
  cardWrap: {
    zIndex: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  iconRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textStrong,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsBox: {
    width: '100%',
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textStrong,
    maxWidth: '58%',
    textAlign: 'right',
  },
  actions: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  btnPrimary: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  btnSecondaryText: {
    color: colors.brandTitle,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
