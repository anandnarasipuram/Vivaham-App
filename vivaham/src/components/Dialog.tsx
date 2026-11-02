import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { ErrorText } from './ui';

type DialogProps = { visible: boolean; title: string; onClose: () => void; children: ReactNode };

export function Dialog({ visible, title, onClose, children }: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  busy,
  error,
  confirmLabel = 'Yes, delete',
  cancelLabel = 'Keep it',
}: ConfirmProps) {
  return (
    <Dialog visible={visible} title={title} onClose={onCancel}>
      <Text style={styles.message}>{message}</Text>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton size="medium" label={busy ? 'Deleting…' : confirmLabel} onPress={onConfirm} disabled={busy} />
      <SecondaryButton label={cancelLabel} onPress={onCancel} disabled={busy} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  center: {
    marginTop: 110,
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: colors.cream,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 20,
    gap: 14,
  },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.ink },
  message: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.brownInk },
});
