import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import BackPill from './BackPill';
import TopStrip from './TopStrip';

type Props = {
  back?: { label: string; onPress: () => void };
  gap?: number;
  children: ReactNode;
};

export default function Screen({ back, gap = 18, children }: Props) {
  return (
    <View style={styles.screen}>
      <TopStrip />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { gap }]}
          keyboardShouldPersistTaps="handled"
        >
          {back ? <BackPill label={back.label} onPress={back.onPress} /> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 32 },
});
