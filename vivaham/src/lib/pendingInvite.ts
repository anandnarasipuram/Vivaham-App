import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'vivaham.pendingInvite';

export async function savePendingInvite(code: string) {
  try {
    await AsyncStorage.setItem(KEY, code);
  } catch {}
}

export async function loadPendingInvite() {
  try {
    return (await AsyncStorage.getItem(KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function clearPendingInvite() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
