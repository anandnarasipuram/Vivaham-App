import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { PasswordField } from '../components/Field';
import Screen from '../components/Screen';
import { ErrorText } from '../components/ui';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

type Props = { linkError: string; onDone: () => void; onCancel: () => void };

export default function SetPasswordScreen({ linkError, onDone, onCancel }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const longEnough = password.length >= 8;
  const matches = password.length > 0 && password === confirm;

  async function save() {
    if (!longEnough || !matches) {
      setError('Use at least 8 characters and type the same password twice.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      onDone();
    }
  }

  return (
    <Screen back={{ label: 'Back', onPress: onCancel }} gap={22}>
      <View style={styles.head}>
        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.body}>Choose something you’ll remember. You’ll use it to log in from now on.</Text>
      </View>
      <ErrorText>{linkError}</ErrorText>
      <PasswordField label="New password" placeholder="At least 8 characters" value={password} onChangeText={setPassword} />
      <PasswordField label="Confirm new password" placeholder="Type it again" value={confirm} onChangeText={setConfirm} />
      <View style={styles.rules}>
        <Rule ok={longEnough} label="At least 8 characters" />
        <Rule ok={matches} label="Both passwords match" />
      </View>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label={saving ? 'Saving…' : 'Save and log in'} onPress={save} disabled={saving} />
    </Screen>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.rule}>
      <View style={[styles.dot, ok && styles.dotOk]}>{ok ? <Text style={styles.tick}>✓</Text> : null}</View>
      <Text style={styles.ruleText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.brownInk },
  rules: { gap: 8 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.tickBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOk: { borderColor: colors.green, backgroundColor: colors.green },
  tick: { fontFamily: fonts.extrabold, fontSize: 10, lineHeight: 12, color: colors.white },
  ruleText: { fontFamily: fonts.medium, fontSize: 14, color: colors.brownInk },
});
