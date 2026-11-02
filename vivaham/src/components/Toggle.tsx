import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { label: string; hint?: string; value: boolean; onChange: (value: boolean) => void };

export default function Toggle({ label, hint, value, onChange }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={styles.row}
      onPress={() => onChange(!value)}
    >
      <View style={styles.flex}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flex: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  track: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.tintSand, padding: 3 },
  trackOn: { backgroundColor: colors.maroon },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: 'flex-end' },
});
