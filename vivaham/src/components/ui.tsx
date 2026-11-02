import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <Text style={styles.lead}>{children}</Text>;
}

export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  if (right === undefined) {
    return <Text style={styles.label}>{children}</Text>;
  }
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{children}</Text>
      {typeof right === 'string' ? <Text style={styles.labelRight}>{right}</Text> : right}
    </View>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <Text style={styles.note}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) {
    return null;
  }
  return <Text style={styles.error}>{children}</Text>;
}

export function EmptyBox({ children, title }: { children?: ReactNode; title?: string }) {
  return (
    <View style={styles.empty}>
      {title ? <Text style={styles.emptyTitle}>{title}</Text> : null}
      {children ? <Text style={styles.emptyText}>{children}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionRule({ label }: { label: string }) {
  return (
    <View style={styles.ruleRow}>
      <Text style={styles.ruleText}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

export function ProgressBar({ ratio, color = colors.gold, track = colors.tintSand }: { ratio: number; color?: string; track?: string }) {
  const percent = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <View style={[styles.bar, { width: `${percent}%`, backgroundColor: color, minWidth: percent > 0 ? 6 : 0 }]} />
    </View>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.segments}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentOn]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextOn]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Badge({ label, tone = 'rose' }: { label: string; tone?: 'rose' | 'gold' | 'green' }) {
  const palette = {
    rose: { backgroundColor: colors.tintRose, color: colors.maroon },
    gold: { backgroundColor: colors.tintGold, color: colors.goldInk },
    green: { backgroundColor: colors.tintGreen, color: colors.green },
  }[tone];
  return (
    <Text style={[styles.badge, { backgroundColor: palette.backgroundColor, color: palette.color }]}>{label}</Text>
  );
}

export function Avatar({ label, size = 40, tone = 'gold' }: { label: string; size?: number; tone?: 'rose' | 'gold' | 'green' }) {
  const palette = {
    rose: { backgroundColor: colors.tintRose, color: colors.maroon },
    gold: { backgroundColor: colors.tintGold, color: colors.goldInk },
    green: { backgroundColor: colors.tintGreen, color: colors.green },
  }[tone];
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.backgroundColor },
      ]}
    >
      <Text style={[styles.avatarText, { color: palette.color, fontSize: size > 36 ? 16 : 13 }]}>{label}</Text>
    </View>
  );
}

export const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    minHeight: 60,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.tintSand },
  grow: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  value: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
});

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5, color: colors.ink },
  lead: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.muted },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  labelRight: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon, textAlign: 'right', flexShrink: 1 },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  error: { fontFamily: fonts.semibold, fontSize: 15, color: colors.maroon },
  empty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    gap: 4,
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: 'center' },
  emptyText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    borderRadius: 16,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleText: { fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 1.5, color: colors.goldDark },
  rule: { flex: 1, height: 1, backgroundColor: colors.rule },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  segments: { flexDirection: 'row', backgroundColor: colors.tintSand, borderRadius: 12, padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentOn: { backgroundColor: colors.white },
  segmentText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.brownInk, textAlign: 'center' },
  segmentTextOn: { fontFamily: fonts.bold, color: colors.maroon },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.extrabold },
});
