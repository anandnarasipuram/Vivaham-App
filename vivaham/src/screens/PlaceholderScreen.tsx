import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

const TITLES: Record<string, string> = {
  Events: 'Events',
  Guests: 'Guests',
  Shopping: 'Shopping',
  Todo: 'To-do',
  Requirements: 'Requirements',
  Budget: 'Budget',
  Food: 'Food & menus',
  Stays: 'Stays',
};

export default function PlaceholderScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const title = TITLES[route.name] ?? route.name;

  return (
    <View style={styles.screen}>
      <View style={[styles.strip, { height: insets.top + 14 }]} />
      <View style={styles.body}>
        {navigation.canGoBack() ? (
          <Pressable style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Home</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>This screen comes in a later step.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  strip: { backgroundColor: colors.maroon, borderBottomWidth: 2, borderBottomColor: colors.gold },
  body: { padding: 20, gap: 12 },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: fonts.bold, fontSize: 17, color: colors.maroon },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
});
