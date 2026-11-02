import { useEffect, useState } from 'react';
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
import { supabase } from './src/lib/supabase';
import { WeddingProvider } from './src/lib/wedding';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loaded || checking) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {session ? (
        <WeddingProvider>
          <AppNavigator />
        </WeddingProvider>
      ) : (
        <LoginScreen />
      )}
    </SafeAreaProvider>
  );
}
