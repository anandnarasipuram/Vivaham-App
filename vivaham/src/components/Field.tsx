import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../theme';
import Icon from './Icon';

type Props = TextInputProps & { label?: string; hint?: string; small?: boolean };

export function Input({ small, style, ...props }: TextInputProps & { small?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.placeholder}
      style={[styles.input, small && styles.small, props.multiline && styles.multiline, style]}
      {...props}
    />
  );
}

export default function Field({ label, hint, small, ...props }: Props) {
  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {hint ? <Text style={styles.hint}> {hint}</Text> : null}
        </Text>
      ) : null}
      <Input small={small} {...props} />
    </View>
  );
}

export function MoneyField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={[styles.field, styles.flex]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.money}>
        <Text style={styles.rupee}>₹</Text>
        <TextInput
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          style={styles.moneyInput}
          {...props}
        />
      </View>
    </View>
  );
}

export function PasswordField({ label, ...props }: TextInputProps & { label: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.password}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          style={styles.passwordInput}
          {...props}
        />
        <Pressable
          style={styles.eye}
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible(!visible)}
        >
          <Icon name="eye" color={colors.muted} size={22} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  flex: { flex: 1 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  hint: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  small: { height: 48, paddingHorizontal: 14, fontSize: 15 },
  multiline: { height: 96, paddingTop: 14, textAlignVertical: 'top' },
  money: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    gap: 6,
  },
  rupee: { fontFamily: fonts.bold, fontSize: 16, color: colors.muted },
  password: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 4,
  },
  passwordInput: { flex: 1, height: 50, fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  moneyInput: { flex: 1, height: 50, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
});
