import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { title: string; children: ReactNode; initiallyOpen?: boolean };

export default function Collapsible({ title, children, initiallyOpen = false }: Props) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  header: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.brownInk },
  chevron: { fontFamily: fonts.bold, fontSize: 15, color: colors.brownInk },
});
