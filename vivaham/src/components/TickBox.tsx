import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { checked: boolean; onPress: () => void; label: string; disabled?: boolean };

export default function TickBox({ checked, onPress, label, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      style={styles.hit}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.box, checked ? styles.on : styles.off]}>{checked ? '✓' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  box: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.white,
  },
  on: { backgroundColor: colors.green },
  off: { borderWidth: 2, borderColor: colors.tickBorder, backgroundColor: colors.white },
});
