import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import Screen from './src/components/Screen';
import { Note } from './src/components/ui';
import { linkParams } from './src/lib/links';
import { supabase } from './src/lib/supabase';
import { useWedding, WeddingProvider } from './src/lib/wedding';
import AppNavigator from './src/navigation/AppNavigator';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import JoinScreen from './src/screens/JoinScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';

function Main() {
  const { wedding, loading, error } = useWedding();
  if (loading) {
    return (
      <Screen>
        <Note>Loading your wedding…</Note>
      </Screen>
    );
  }
  if (!wedding && !error) {
    return <OnboardingScreen />;
  }
  return <AppNavigator />;
}

export default function App() {
  const [loaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<'login' | 'forgot' | 'join'>('login');
  const [joinCode, setJoinCode] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') {
        setRecovering(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handle(url: string | null | undefined) {
      if (!url) {
        return;
      }
      const join = url.match(/join\/([A-Za-z0-9]{4,12})/);
      if (join) {
        setJoinCode(join[1].toUpperCase());
        setView('join');
        return;
      }
      const params = linkParams(url);
      if (params.error_description) {
        setLinkError(`The reset link did not work: ${params.error_description}. Ask for a new one.`);
        return;
      }
      if (params.type === 'recovery' && params.access_token && params.refresh_token) {
        setLinkError('');
        setRecovering(true);
        supabase.auth
          .setSession({ access_token: params.access_token, refresh_token: params.refresh_token })
          .then(({ error }) => {
            if (error) {
              setLinkError(error.message);
            }
          });
      }
    }
    Linking.getInitialURL().then(handle);
    const subscription = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => subscription.remove();
  }, []);

  if (!loaded || checking) {
    return null;
  }

  let content;
  if (recovering) {
    content = (
      <SetPasswordScreen
        linkError={linkError}
        onDone={() => {
          setRecovering(false);
          setView('login');
        }}
        onCancel={() => {
          setRecovering(false);
          supabase.auth.signOut();
        }}
      />
    );
  } else if (view === 'join') {
    content = (
      <JoinScreen
        key={joinCode}
        initialCode={joinCode}
        onDone={() => setView('login')}
        onCancel={() => setView('login')}
      />
    );
  } else if (session) {
    content = (
      <WeddingProvider>
        <Main />
      </WeddingProvider>
    );
  } else if (view === 'forgot') {
    content = <ForgotPasswordScreen onBack={() => setView('login')} />;
  } else {
    content = <LoginScreen onForgot={() => setView('forgot')} onJoin={() => setView('join')} notice={linkError} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {content}
    </SafeAreaProvider>
  );
}
