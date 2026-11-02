import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinkButton, PrimaryButton } from '../components/Buttons';
import Field from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import { ErrorText } from '../components/ui';
import { resetRedirectUrl } from '../lib/links';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

export default function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!email.trim()) {
      setError('Enter the email you signed up with.');
      return;
    }
    setSending(true);
    setError('');
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: await resetRedirectUrl(),
    });
    setSending(false);
    if (sendError) {
      setError(sendError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <Screen back={{ label: 'Log in', onPress: onBack }} gap={22}>
      <View style={styles.badge}>
        <Icon name="lock" color={colors.maroon} size={30} />
      </View>
      <View style={styles.head}>
        <Text style={styles.title}>{sent ? 'Check your email' : 'Forgot your password?'}</Text>
        <Text style={styles.body}>
          {sent
            ? `We sent a link to ${email.trim()}. Open it on this phone to set a new password. It can take a minute to arrive, so check spam too.`
            : 'No problem. Enter the email you signed up with and we’ll send you a link to set a new one.'}
        </Text>
      </View>
      {sent ? (
        <PrimaryButton label="Back to log in" onPress={onBack} />
      ) : (
        <>
          <Field
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <ErrorText>{error}</ErrorText>
          <PrimaryButton label={sending ? 'Sending…' : 'Send reset link'} onPress={send} disabled={sending} />
          <View style={styles.remember}>
            <Text style={styles.body}>Remembered it?</Text>
            <LinkButton label="Log in" onPress={onBack} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tintGold,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.brownInk },
  remember: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
