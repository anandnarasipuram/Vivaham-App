import { Linking, Platform } from 'react-native';

export async function resetRedirectUrl() {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/reset-password`;
  }
  const initial = await Linking.getInitialURL();
  if (initial && initial.startsWith('exp')) {
    const base = initial.split('#')[0].split('?')[0].split('/--/')[0];
    return `${base}/--/reset-password`;
  }
  return 'vivaham://reset-password';
}

export function linkParams(url: string) {
  const params: Record<string, string> = {};
  const parts = [url.split('#')[1] ?? '', url.split('#')[0].split('?')[1] ?? ''];
  parts
    .join('&')
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const [key, value = ''] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    });
  return params;
}
