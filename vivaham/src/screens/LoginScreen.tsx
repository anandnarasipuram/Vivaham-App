import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email or password is not correct.'
          : signInError.message
      );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logo}>
          <Svg
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.maroon}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M12 3c2 3 3 4.5 3 6a3 3 0 0 1-6 0c0-1.5 1-3 3-6z" fill={colors.gold} stroke={colors.goldDark} />
            <Path d="M4 14h16l-2.5 4h-11z" />
            <Path d="M9 21h6" />
          </Svg>
        </View>
        <Text style={styles.brand}>Vivaham</Text>
        <Text style={styles.tagline}>Plan every ceremony, together</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Welcome back</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              style={styles.eye}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.muted}
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <Circle cx={12} cy={12} r={3} />
              </Svg>
            </Pressable>
          </View>
          <Pressable style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.spacer} />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in…' : 'Log in'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1 },
  header: {
    height: 270,
    backgroundColor: colors.maroon,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontFamily: fonts.heading, fontSize: 38, color: colors.white },
  tagline: { fontFamily: fonts.semibold, fontSize: 15, color: colors.goldLight },
  body: { flex: 1, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 24, gap: 20 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.ink },
  field: { gap: 8 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 4,
  },
  passwordInput: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  forgot: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center' },
  forgotText: { fontFamily: fonts.bold, fontSize: 15, color: colors.maroon },
  error: { fontFamily: fonts.semibold, fontSize: 15, color: colors.maroon },
  spacer: { flex: 1 },
  button: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
});
