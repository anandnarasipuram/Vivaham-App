const LIVE_APP_URL = 'https://vivaham-app.an-e5e.workers.dev';

export const APP_URL = ((process.env.EXPO_PUBLIC_APP_URL ?? '').trim() || LIVE_APP_URL).replace(/\/+$/, '');
