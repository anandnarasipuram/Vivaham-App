import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function TopStrip() {
  const insets = useSafeAreaInsets();
  return <View style={[styles.strip, { height: insets.top + 14 }]} />;
}

const styles = StyleSheet.create({
  strip: { backgroundColor: colors.maroon, borderBottomWidth: 2, borderBottomColor: colors.gold },
});
