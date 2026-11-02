import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';
import Chevron from './Chevron';

type Props = { label: string; onPress: () => void };

export default function BackPill({ label, onPress }: Props) {
  return (
    <Pressable style={styles.pill} onPress={onPress}>
      <Chevron direction="left" color={colors.ink} size={20} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingLeft: 10,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tileBorder,
  },
  text: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
