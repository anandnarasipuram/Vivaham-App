import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackPill from '../components/BackPill';
import TopStrip from '../components/TopStrip';
import { colors, fonts } from '../theme';

export default function EventDetailScreen() {
  const navigation = useNavigation<{ goBack: () => void }>();
  return (
    <View style={styles.screen}>
      <TopStrip />
      <View style={styles.body}>
        <BackPill label="All events" onPress={() => navigation.goBack()} />
        <Text style={styles.note}>Event details come in the next step.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  body: { paddingTop: 16, paddingHorizontal: 20, gap: 20 },
  note: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
});
