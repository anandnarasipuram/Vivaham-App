import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import type { Option } from './Chips';
import Icon from './Icon';

type Props = {
  options: Option[];
  value: string | null;
  onChange: (key: string) => void;
  placeholder?: string;
  title?: string;
  small?: boolean;
  disabled?: boolean;
};

export default function SelectRow({ options, value, onChange, placeholder = 'Choose', title, small, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.key === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[styles.button, small && styles.small, disabled && styles.disabled]}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.text, small && styles.smallText, !current && styles.placeholder]} numberOfLines={1}>
          {current?.label ?? placeholder}
        </Text>
        <Icon name="down" color={colors.ink} size={small ? 16 : 18} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const selected = option.key === value;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityState={{ selected }}
                    style={[styles.option, selected && styles.optionOn]}
                    onPress={() => {
                      onChange(option.key);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextOn]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  small: { minHeight: 44, paddingHorizontal: 10, borderRadius: 8 },
  disabled: { opacity: 0.6 },
  text: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  smallText: { fontSize: 14, fontFamily: fonts.medium },
  placeholder: { color: colors.placeholder },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 24 },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    padding: 8,
    maxHeight: '75%',
  },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, padding: 10 },
  list: { flexGrow: 0 },
  option: { minHeight: 48, borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' },
  optionOn: { backgroundColor: colors.tintRose },
  optionText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  optionTextOn: { fontFamily: fonts.bold, color: colors.maroon },
});
