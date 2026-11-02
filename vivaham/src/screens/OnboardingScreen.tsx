import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinkButton, PrimaryButton } from '../components/Buttons';
import Calendar from '../components/Calendar';
import { Input } from '../components/Field';
import Screen from '../components/Screen';
import { ErrorText } from '../components/ui';
import { fullDate, weddingTag } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useWedding } from '../lib/wedding';
import { colors, fonts } from '../theme';

export default function OnboardingScreen() {
  const { reload } = useWedding();
  const [name, setName] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!name.trim()) {
      setError('Write whose wedding this is, for example Akhil.');
      return;
    }
    if (!date) {
      setError('Pick the wedding date on the calendar.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: createError } = await supabase.rpc('create_wedding', {
      p_name: `${name.trim()}’s wedding`,
      p_date: date,
    });
    if (createError) {
      setError(createError.message);
      setSaving(false);
      return;
    }
    await reload();
  }

  return (
    <Screen gap={24}>
      <View style={styles.head}>
        <Text style={styles.kicker}>WELCOME</Text>
        <Text style={styles.title}>Let’s set up your wedding</Text>
        <Text style={styles.body}>Two quick questions. You can change these later.</Text>
      </View>
      <View style={styles.group}>
        <Text style={styles.question}>
          <Text style={styles.number}>1. </Text>Whose wedding is this?
        </Text>
        <Input accessibilityLabel="Whose wedding is this?" placeholder="e.g. Akhil" autoCapitalize="words" value={name} onChangeText={setName} />
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Your Home screen will show</Text>
          <Text style={styles.previewTag}>{weddingTag(name.trim())}</Text>
        </View>
      </View>
      <View style={styles.group}>
        <View style={styles.between}>
          <Text style={styles.question}>
            <Text style={styles.number}>2. </Text>When is the wedding?
          </Text>
          <Text style={styles.dateLabel}>{date ? fullDate(date) : ''}</Text>
        </View>
        <Calendar value={date} onChange={setDate} />
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Setting up…' : 'Continue to Home'} onPress={save} disabled={saving} />
      <LinkButton label="Log out" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 8, paddingTop: 16 },
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.goldDark },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 16, color: colors.brownInk },
  group: { gap: 10 },
  question: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, flexShrink: 1 },
  number: { color: colors.goldDark },
  preview: {
    backgroundColor: colors.maroon,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  previewLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.goldLight },
  previewTag: { fontFamily: fonts.extrabold, fontSize: 15, letterSpacing: 2, color: colors.white },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  dateLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.maroon, textAlign: 'right' },
});
