import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import Stepper from './Stepper';

type Props = { value: string; onChange: (time: string) => void };

const MINUTES = [0, 15, 30, 45];

function compose(hour12: number, minute: number, pm: boolean) {
  const hours = (hour12 % 12) + (pm ? 12 : 0);
  return `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

export default function TimePicker({ value, onChange }: Props) {
  const [hours, minute] = value.split(':').map(Number);
  const pm = hours >= 12;
  const hour12 = hours % 12 || 12;

  function setHour(next: number) {
    const wrapped = next > 12 ? 1 : next < 1 ? 12 : next;
    onChange(compose(wrapped, minute, pm));
  }

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={styles.label}>Hour</Text>
        <View style={styles.flex}>
          <Stepper
            wide
            name="hour"
            value={hour12}
            min={0}
            max={13}
            onChange={setHour}
            label={String(hour12)}
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Minute</Text>
        <View style={[styles.flex, styles.minutes]}>
          {MINUTES.map((option) => {
            const selected = option === minute;
            return (
              <Pressable
                key={option}
                accessibilityState={{ selected }}
                style={[styles.option, selected && styles.optionOn]}
                onPress={() => onChange(compose(hour12, option, pm))}
              >
                <Text style={[styles.optionText, selected && styles.optionTextOn]}>
                  {`:${String(option).padStart(2, '0')}`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.halves}>
        {[false, true].map((half) => {
          const selected = half === pm;
          return (
            <Pressable
              key={String(half)}
              accessibilityState={{ selected }}
              style={[styles.option, styles.half, selected && styles.optionOn]}
              onPress={() => onChange(compose(hour12, minute, half))}
            >
              <Text style={[styles.optionText, selected && styles.optionTextOn]}>
                {half ? 'Afternoon / Evening (PM)' : 'Morning (AM)'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 56, fontFamily: fonts.semibold, fontSize: 14, color: colors.brownInk },
  flex: { flex: 1 },
  minutes: { flexDirection: 'row', gap: 6 },
  halves: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  half: { minHeight: 52 },
  optionOn: { borderWidth: 2, borderColor: colors.maroon, backgroundColor: colors.tintRose },
  optionText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, textAlign: 'center' },
  optionTextOn: { fontFamily: fonts.bold, color: colors.maroon },
});
