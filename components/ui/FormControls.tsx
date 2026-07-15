import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { colors, radius, spacing } from '@/constants/colors';

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, style, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function AppButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonSecondaryText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

type SearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchProps) {
  return (
    <GlassCard padded={false} style={styles.searchWrap} contentStyle={styles.searchInner}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </GlassCard>
  );
}

type Chip = { key: string; label: string };

type ChipProps = {
  options: readonly Chip[] | Chip[];
  value: string;
  onChange: (key: string) => void;
};

export function FilterChipGroup({ options, value, onChange }: ChipProps) {
  return (
    <View style={styles.chips}>
      {options.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandTitle,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.inputBg,
    color: colors.inputText,
    fontSize: 15,
  },
  inputError: { borderColor: colors.danger },
  error: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: 12,
  },
  button: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonSecondary: {
    backgroundColor: colors.buttonSecondaryBg,
    borderWidth: 1.5,
    borderColor: colors.buttonSecondaryBorder,
  },
  buttonDanger: { backgroundColor: colors.danger, borderColor: 'transparent' },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  buttonText: {
    color: colors.buttonText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  buttonSecondaryText: { color: colors.buttonSecondaryText },
  searchWrap: { marginBottom: spacing.md },
  searchInner: { paddingHorizontal: 0, paddingVertical: 0 },
  search: {
    height: 48,
    paddingHorizontal: spacing.lg,
    color: colors.textBody,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
  },
  chipActive: {
    backgroundColor: colors.brandTitle,
    borderColor: colors.brandTitle,
  },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.white },
});
