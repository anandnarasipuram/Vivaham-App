import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isoDate, MONTHS_LONG, parseDate } from '../lib/format';
import { colors, fonts } from '../theme';
import Chevron from './Chevron';

type Props = {
  value?: string | null;
  onChange?: (iso: string) => void;
  rangeStart?: string | null;
  rangeEnd?: string | null;
  onRangeChange?: (start: string | null, end: string | null) => void;
  initialMonth?: string | null;
};

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function Calendar({ value, onChange, rangeStart, rangeEnd, onRangeChange, initialMonth }: Props) {
  const start = parseDate(value ?? rangeStart ?? initialMonth ?? isoDate(new Date()));
  const [year, setYear] = useState(start.getFullYear());
  const [month, setMonth] = useState(start.getMonth());
  const isRange = Boolean(onRangeChange);

  function shift(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function pick(iso: string) {
    if (!onRangeChange) {
      onChange?.(iso);
      return;
    }
    if (!rangeStart || rangeEnd) {
      onRangeChange(iso, null);
    } else if (iso <= rangeStart) {
      onRangeChange(iso, null);
    } else {
      onRangeChange(rangeStart, iso);
    }
  }

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= days; day += 1) {
    cells.push(isoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const today = isoDate(new Date());

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Previous month" style={styles.nav} onPress={() => shift(-1)}>
          <Chevron direction="left" color={colors.ink} size={18} />
        </Pressable>
        <Text style={styles.month}>{`${MONTHS_LONG[month]} ${year}`}</Text>
        <Pressable accessibilityLabel="Next month" style={styles.nav} onPress={() => shift(1)}>
          <Chevron direction="right" color={colors.ink} size={18} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {WEEK.map((day) => (
          <Text key={day} style={[styles.cell, styles.week]}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((iso, index) => {
          if (!iso) {
            return <View key={`blank-${index}`} style={styles.cell} />;
          }
          const selected = isRange ? iso === rangeStart || iso === rangeEnd : iso === value;
          const between = isRange && rangeStart && rangeEnd && iso > rangeStart && iso < rangeEnd;
          return (
            <Pressable
              key={iso}
              accessibilityLabel={iso}
              accessibilityState={{ selected }}
              style={[styles.cell, between && styles.between]}
              onPress={() => pick(iso)}
            >
              <View style={[styles.day, selected && styles.daySelected, iso === today && !selected && styles.today]}>
                <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{parseDate(iso).getDate()}</Text>
              </View>
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
    gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' },
  week: { height: 20, fontFamily: fonts.bold, fontSize: 12, color: colors.muted, textAlign: 'center' },
  between: { backgroundColor: colors.tintRose },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: colors.maroon },
  today: { borderWidth: 1.5, borderColor: colors.gold },
  dayText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  dayTextSelected: { fontFamily: fonts.extrabold, color: colors.white },
});
