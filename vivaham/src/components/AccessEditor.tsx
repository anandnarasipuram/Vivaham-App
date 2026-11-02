import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LEVELS, Level, levelOf, MODULES } from '../lib/roles';
import { colors, fonts } from '../theme';

type Props = {
  modules: Record<string, string> | null;
  onChange: (module: string, level: Level) => void;
  disabled?: boolean;
};

export default function AccessEditor({ modules, onChange, disabled }: Props) {
  return (
    <View style={styles.list}>
      {MODULES.map((module) => {
        const current = levelOf(modules, module.key);
        return (
          <View key={module.key} style={styles.row}>
            <Text style={styles.label}>{module.label}</Text>
            <View style={styles.levels}>
              {LEVELS.map((level) => {
                const selected = level.key === current;
                return (
                  <Pressable
                    key={level.key}
                    accessibilityRole="radio"
                    accessibilityLabel={`${module.label}: ${level.label}`}
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    style={[styles.level, selected && styles.levelOn]}
                    onPress={() => onChange(module.key, level.key)}
                  >
                    <Text style={[styles.levelText, selected && styles.levelTextOn]}>{level.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { width: 100, fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  levels: { flex: 1, flexDirection: 'row', backgroundColor: colors.tintSand, borderRadius: 10, padding: 3, gap: 3 },
  level: { flex: 1, minHeight: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  levelOn: { backgroundColor: colors.white },
  levelText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.brownInk },
  levelTextOn: { fontFamily: fonts.bold, color: colors.maroon },
});
