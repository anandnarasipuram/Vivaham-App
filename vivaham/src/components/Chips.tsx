import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { AddButton } from './Buttons';
import { Input } from './Field';

export type Option = { key: string; label: string };

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
  block?: boolean;
  disabled?: boolean;
};

export function Chip({ label, selected, onPress, onRemove, block, disabled }: ChipProps) {
  return (
    <View
      style={[
        block ? styles.block : styles.pill,
        selected ? styles.on : styles.off,
        onRemove && styles.withRemove,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        style={[styles.press, block && styles.pressBlock]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.text, block && styles.textBlock, selected && styles.textOn]}>{label}</Text>
      </Pressable>
      {onRemove ? (
        <Pressable accessibilityLabel={`Remove ${label}`} style={styles.remove} onPress={onRemove}>
          <Text style={[styles.removeText, selected && styles.textOn]}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type GroupProps = {
  options: Option[];
  selected: string[];
  onPress: (key: string) => void;
  columns?: number;
  check?: boolean;
  disabled?: boolean;
};

export function ChipGroup({ options, selected, onPress, columns, check, disabled }: GroupProps) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const on = selected.includes(option.key);
        return (
          <View key={option.key} style={columns ? { flexBasis: `${100 / columns - 3}%`, flexGrow: 1 } : undefined}>
            <Chip
              block={Boolean(columns)}
              label={check && on ? `✓ ${option.label}` : option.label}
              selected={on}
              disabled={disabled}
              onPress={() => onPress(option.key)}
            />
          </View>
        );
      })}
    </View>
  );
}

type EditableProps = {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
};

export function EditableChips({ options, onOptionsChange, value, onChange, placeholder }: EditableProps) {
  const [draft, setDraft] = useState('');

  function add() {
    const name = draft.trim();
    if (!name) {
      return;
    }
    const existing = options.find((option) => option.toLowerCase() === name.toLowerCase());
    if (!existing) {
      onOptionsChange([...options, name]);
    }
    onChange(existing ?? name);
    setDraft('');
  }

  function remove(option: string) {
    onOptionsChange(options.filter((item) => item !== option));
    if (value === option) {
      onChange(null);
    }
  }

  return (
    <View style={styles.editable}>
      {options.length > 0 ? (
        <View style={styles.wrap}>
          {options.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={value === option}
              onPress={() => onChange(value === option ? null : option)}
              onRemove={() => remove(option)}
            />
          ))}
        </View>
      ) : null}
      <View style={styles.addRow}>
        <Input
          small
          style={styles.flex}
          placeholder={placeholder}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <AddButton onPress={add} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  editable: { gap: 10 },
  addRow: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderRadius: 999 },
  block: { flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: 12 },
  on: { borderWidth: 2, borderColor: colors.maroon, backgroundColor: colors.tintRose },
  off: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  withRemove: { paddingRight: 0 },
  press: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 14 },
  pressBlock: { flex: 1, minHeight: 48, alignItems: 'center', paddingHorizontal: 10 },
  text: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  textBlock: { fontSize: 16, textAlign: 'center' },
  textOn: { fontFamily: fonts.bold, color: colors.maroon },
  remove: { width: 36, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: fonts.semibold, fontSize: 18, color: colors.muted },
});
