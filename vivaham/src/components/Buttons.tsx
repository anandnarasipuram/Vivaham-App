import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  size = 'large',
  color = colors.maroon,
  icon,
}: ButtonProps & { size?: 'large' | 'medium' | 'small'; color?: string; icon?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.primary, styles[size], { backgroundColor: color }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={[styles.primaryText, size === 'large' ? styles.text17 : size === 'medium' ? styles.text16 : styles.text15]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  tone = 'ink',
  icon,
}: ButtonProps & { tone?: 'ink' | 'maroon'; icon?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.secondary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={[styles.secondaryText, tone === 'maroon' && styles.maroonText]}>{label}</Text>
    </Pressable>
  );
}

export function AddButton({ label = '+ Add', onPress, disabled, height = 48 }: Partial<ButtonProps> & { onPress: () => void; height?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.add, { height }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.link} onPress={onPress} disabled={disabled}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  onPress,
  label,
  children,
  disabled,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.icon, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
    >
      <View>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  large: { minHeight: 56, borderRadius: 28 },
  medium: { minHeight: 52, borderRadius: 26 },
  small: { minHeight: 44, borderRadius: 22, alignSelf: 'center' },
  primaryText: { fontFamily: fonts.bold, color: colors.white },
  text17: { fontSize: 17 },
  text16: { fontSize: 16 },
  text15: { fontSize: 15 },
  disabled: { opacity: 0.55 },
  secondary: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  secondaryText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  maroonText: { color: colors.maroon },
  add: {
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.maroon,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
  link: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
