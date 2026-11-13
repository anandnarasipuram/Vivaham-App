// "Install Vivaham": put the app on the phone's home screen. There is no app store download; the browser does it.
//   Android (Chrome): the browser hands us an install prompt we can open with one button.
//   iPhone: Apple gives web apps no button; the person uses Share -> Add to Home Screen.
import { h } from './ui.js';
import { t } from './i18n.js';
import { capture } from './track.js';

let deferred = null, offered = '';
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { deferred = null; });
}
const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; } };
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent || '');
// 'installed' | 'android' (one-tap) | 'ios' (manual steps) | 'other' (browser menu)
export const installState = () => (standalone() ? 'installed' : deferred ? 'android' : ios() ? 'ios' : 'other');

const LATER_DAYS = 7;
const snoozed = () => { try { return Date.now() - Number(localStorage.getItem('install_later') || 0) < LATER_DAYS * 864e5; } catch { return false; } };
const snooze = () => { try { localStorage.setItem('install_later', String(Date.now())); } catch { /* */ } };

export const iosSteps = () => h('ol', { class: 'steps' },
  h('li', null, t('Tap the Share button'), ' ', h('b', null, '⬆︎'), ' ', t('at the bottom of the screen.')),
  h('li', null, t('Choose'), ' ', h('b', null, t('Add to Home Screen')), '.'),
  h('li', null, t('Tap'), ' ', h('b', null, t('Add')), '. ', t('Vivaham is now on your phone like any other app.')));

async function install(done) {
  const p = deferred; if (!p) return;
  capture('install_started');
  p.prompt();
  const { outcome } = await p.userChoice;
  deferred = null;
  capture(outcome === 'accepted' ? 'install_accepted' : 'install_declined');
  done();
}

// card for the Home screen; null when there is nothing to offer (already installed, snoozed, unknown browser)
export function installCard(redraw, { always = false } = {}) {
  const st = installState();
  if (st === 'installed' || (!always && (st === 'other' || snoozed()))) return null;
  const later = () => { snooze(); capture('install_later'); redraw(); };
  if (offered !== st && (st !== 'other' || !always)) { offered = st; capture('install_offered', { how: st }); }
  return h('div', { class: 'card install' },
    h('b', null, '📲 ' + t('Put Vivaham on your phone')),
    h('div', { class: 'mute', style: 'margin:4px 0 10px' }, t('Open it with one tap from your home screen, like any other app. It is free and needs no app store.')),
    st === 'android' ? h('div', { class: 'row' },
      h('button', { class: 'btn sm', onclick: () => install(redraw) }, t('Install')),
      !always && h('button', { class: 'btn sm ghost', onclick: later }, t('Later')))
    : st === 'ios' ? [iosSteps(), !always && h('button', { class: 'btn sm ghost', onclick: later }, t('Got it'))]
    : h('div', { class: 'small' }, t('Open the browser menu (⋮) and choose "Add to Home screen" or "Install app".')));
}
