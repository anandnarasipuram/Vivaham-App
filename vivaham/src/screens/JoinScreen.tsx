import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinkButton, PrimaryButton } from '../components/Buttons';
import Field, { PasswordField } from '../components/Field';
import Icon from '../components/Icon';
import Screen from '../components/Screen';
import Toggle from '../components/Toggle';
import { ErrorText } from '../components/ui';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

type Props = { initialCode?: string; onDone: () => void; onCancel: () => void };

export function cleanCode(text: string) {
  return text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export async function acceptInvite(code: string, name: string) {
  const { error } = await supabase.rpc('accept_invite', { p_code: cleanCode(code), p_name: name.trim() });
  return error ? error.message : '';
}

export default function JoinScreen({ initialCode = '', onDone, onCancel }: Props) {
  const linked = cleanCode(initialCode).length === 8;
  const [step, setStep] = useState(linked ? 2 : 1);
  const [code, setCode] = useState(cleanCode(initialCode));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAccount, setHasAccount] = useState(false);
  const [signedInAs, setSignedInAs] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSignedInAs(user?.email ?? '');
      const saved = user?.user_metadata?.display_name;
      if (typeof saved === 'string' && saved.trim()) {
        setName((current) => current || saved.trim());
      }
    });
  }, []);

  function next() {
    if (cleanCode(code).length !== 8) {
      setError('The invite code has 8 letters and numbers.');
      return;
    }
    setError('');
    setStep(2);
  }

  async function join() {
    if (!name.trim()) {
      setError('Write your name so the family knows who joined.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    if (!signedInAs) {
      if (!email.trim() || password.length < (hasAccount ? 1 : 8)) {
        setError(hasAccount ? 'Enter your email and password.' : 'Enter your email and a password of at least 8 characters.');
        setBusy(false);
        return;
      }
      if (hasAccount) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) {
          setError(signInError.message === 'Invalid login credentials' ? 'Email or password is not correct.' : signInError.message);
          setBusy(false);
          return;
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (signUpError) {
          setError(signUpError.message);
          setBusy(false);
          return;
        }
        if (!data.session) {
          setNotice('Check your email to confirm your account, then open the invite link again.');
          setBusy(false);
          return;
        }
      }
    }
    const message = await acceptInvite(code, name);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    setStep(3);
  }

  if (step === 3) {
    return (
      <Screen gap={22}>
        <View style={styles.badge}>
          <Icon name="check" color={colors.green} size={30} />
        </View>
        <Text style={styles.title}>You’ve joined the wedding</Text>
        <Text style={styles.body}>Welcome, {name.trim()}! You can now see everything the family has shared with you.</Text>
        <PrimaryButton label="Go to Home" onPress={onDone} />
      </Screen>
    );
  }

  return (
    <Screen
      back={
        step === 1 || linked
          ? { label: signedInAs ? 'Cancel' : 'Log in', onPress: onCancel }
          : { label: 'Back', onPress: () => setStep(1) }
      }
      gap={22}
    >
      <Text style={styles.kicker}>{linked ? 'JOIN A WEDDING' : `STEP ${step} OF 3`}</Text>
      {step === 1 ? (
        <>
          <View style={styles.head}>
            <Text style={styles.title}>Join a wedding</Text>
            <Text style={styles.body}>Enter the invite code the family sent you.</Text>
          </View>
          <Field
            label="Invite code"
            placeholder="e.g. AB12CD34"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
            value={code}
            onChangeText={(text) => setCode(cleanCode(text))}
            style={styles.codeInput}
          />
          <ErrorText>{error}</ErrorText>
          <PrimaryButton label="Next" onPress={next} />
        </>
      ) : (
        <>
          <View style={styles.head}>
            <Text style={styles.title}>About you</Text>
            <Text style={styles.body}>
              {signedInAs ? `You are logged in as ${signedInAs}.` : 'Create your account, or log in if you already have one.'}
            </Text>
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.codeNote}>{`Invite code ${cleanCode(code)} ✓`}</Text>
            <LinkButton label="Change" onPress={() => setStep(1)} />
          </View>
          <Field label="Your name" placeholder="e.g. Soundarya" autoCapitalize="words" value={name} onChangeText={setName} />
          {!signedInAs ? (
            <>
              <Toggle label="I already have an account" value={hasAccount} onChange={setHasAccount} />
              <Field
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <PasswordField
                label="Password"
                placeholder={hasAccount ? 'Your password' : 'At least 8 characters'}
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : null}
          <ErrorText>{error}</ErrorText>
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <PrimaryButton label={busy ? 'Joining…' : 'Join the wedding'} onPress={join} disabled={busy} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, color: colors.goldDark, marginTop: 8 },
  head: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.brownInk },
  codeInput: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  codeNote: { fontFamily: fonts.bold, fontSize: 15, color: colors.green },
  notice: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.green },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tintGreen,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});
