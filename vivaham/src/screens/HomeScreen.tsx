import { Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

type Props = { email: string };

export default function HomeScreen({ email }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>Vivaham</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>You are logged in</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.note}>The real Home screen comes in a later step.</Text>
        <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    height: 150,
    backgroundColor: colors.maroon,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  brand: { fontFamily: fonts.heading, fontSize: 32, color: colors.white },
  body: { flex: 1, padding: 20, gap: 12 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.ink },
  email: { fontFamily: fonts.semibold, fontSize: 16, color: colors.muted },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  button: {
    marginTop: 24,
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
});
