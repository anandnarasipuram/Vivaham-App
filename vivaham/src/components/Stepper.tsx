import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  wide?: boolean;
  compact?: boolean;
  name?: string;
  disabled?: boolean;
};

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
  label,
  wide,
  compact,
  name = 'value',
  disabled,
}: Props) {
  const size = compact ? 44 : wide ? 52 : 48;
  return (
    <View style={[styles.box, wide && styles.wide, !compact && styles.filled]}>
      <Pressable
        accessibilityLabel={`Less ${name}`}
        style={[styles.button, { width: size, height: size }]}
        disabled={disabled || value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
      >
        <Text style={[styles.sign, (disabled || value <= min) && styles.faded]}>−</Text>
      </Pressable>
      <Text style={[styles.value, wide ? styles.valueWide : { minWidth: compact ? 32 : 44 }]}>{label ?? value}</Text>
      <Pressable
        accessibilityLabel={`More ${name}`}
        style={[styles.button, { width: size, height: size }]}
        disabled={disabled || value >= max}
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Text style={[styles.sign, (disabled || value >= max) && styles.faded]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: { backgroundColor: colors.white },
  wide: { justifyContent: 'space-between' },
  button: { alignItems: 'center', justifyContent: 'center' },
  sign: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  faded: { color: colors.placeholder },
  value: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink, textAlign: 'center' },
  valueWide: { fontSize: 20 },
});
