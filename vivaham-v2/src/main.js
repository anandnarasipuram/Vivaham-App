import './style.css';
import { sb, configured } from './lib/supabase.js';
import { S } from './lib/store.js';
import { h, clear, fail, toast } from './lib/ui.js';
import { t, setLang, getLang } from './lib/i18n.js';
import { loadWeddings, loadContext } from './lib/api.js';
import * as auth from './screens/auth.js';

const app = document.getElementById('app');
const routes = {};
export const register = (name, mod) => (routes[name] = mod);

const NAV = [['home', '🏠', 'Home'], ['profile', '👤', 'Profile'], ['materials', '🧺', 'Materials'], ['tasks', '✅', 'To-do']];

// page shell: header + content + bottom nav
export function page({ title, sub, back, right, nav = true, fab }, ...content) {
  clear(app);
  const hdr = h('div', { class: 'hdr' }, h('div', { class: 'in' },
    back && h('button', { class: 'back', onclick: () => (location.hash = back) }, '←'),
    h('div', { class: 'grow' }, h('h1', null, title), sub && h('div', { class: 'sub' }, sub)),
    right));
  app.append(hdr, h('main', null, ...content));
  if (fab) app.append(h('button', { class: 'fab', onclick: fab.onclick }, '+ ' + fab.label));
  if (nav) {
    const cur = parseHash().name;
    app.append(h('nav', { class: 'nav' }, ...NAV.map(([k, i, l]) => h('a', { href: '#/' + k, class: cur === k ? 'on' : '' }, h('span', { class: 'i' }, i), t(l)))));
  }
  window.scrollTo(0, 0);
}
export function plain(...content) { clear(app); app.append(h('div', { class: 'auth' }, ...content)); }

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] || '', id: parts[1], q: Object.fromEntries(new URLSearchParams(qs || '')) };
}

const PUBLIC = ['login', 'signup', 'forgot', 'reset', 'join'];
let token = 0, recovery = false;

export async function go() {
  const my = ++token;
  const r = parseHash();
  if (!configured) return plain(h('h1', { class: 'serif' }, 'Almost there'), h('p', null, 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file (see .env.example), then restart.'));
  try {
    if (recovery && r.name !== 'reset') { location.hash = '#/reset'; return; }
    if (!S.user) {
      const { data } = await sb.auth.getSession();
      S.user = data.session?.user || null;
    }
    if (!S.user) {
      if (!PUBLIC.includes(r.name)) { location.hash = '#/login'; return; }
      return auth.screens[r.name]({ q: r.q });
    }
    if (!S.profile) {
      const { data } = await sb.from('profiles').select('*').eq('user_id', S.user.id).maybeSingle();
      S.profile = data || { name: '', language: 'en' };
      if (data?.language) setLang(data.language);
    }
    if (r.name === 'reset') return auth.screens.reset({ q: r.q });
    if (r.name === 'join') return auth.screens.join({ q: r.q });
    if (!S.wedding) await loadWeddings();
    if (!S.wedding) { if (r.name !== 'onboard') { location.hash = '#/onboard'; return; } return auth.screens.onboard({}); }
    if (PUBLIC.includes(r.name) || r.name === 'onboard' || !r.name) { location.hash = '#/home'; return; }
    await loadContext();
    if (my !== token) return;
    const mod = routes[r.name];
    if (!mod) { location.hash = '#/home'; return; }
    await mod.render({ id: r.id, q: r.q }, () => go());
  } catch (e) { fail(e); }
}

export async function reloadAll() { S.wedding = null; S.members = []; S.events = []; await loadWeddings(); }
export function afterAuthRedirect() {
  const code = sessionStorage.getItem('joinCode');
  location.hash = code ? '#/join?code=' + encodeURIComponent(code) : '#/home';
  go();
}

if (configured) {
  sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') { recovery = true; S.user = session?.user || null; go(); }
    if (ev === 'SIGNED_OUT') { Object.assign(S, { user: null, profile: null, wedding: null, weddings: [], members: [], events: [] }); recovery = false; }
  });
}
export const endRecovery = () => (recovery = false);

// live updates: any change in the wedding redraws the current screen (not while a form is open)
let rt, deb;
export function startRealtime() {
  if (rt || !configured) return;
  rt = sb.channel('vivaham-live').on('postgres_changes', { event: '*', schema: 'vivaham' }, () => {
    clearTimeout(deb);
    deb = setTimeout(() => { if (!document.querySelector('.ov')) go(); }, 600);
  }).subscribe();
}

// a recovery link lands on /#access_token=...&type=recovery : turn it into a session
async function bootRecovery() {
  const hash = location.hash;
  if (hash.includes('type=recovery') && hash.includes('access_token')) {
    const p = new URLSearchParams(hash.replace(/^#\/?/, ''));
    await sb.auth.setSession({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token') });
    recovery = true; history.replaceState(null, '', location.pathname + '#/reset');
  }
}

import('./screens/index.js').then(async () => {
  document.documentElement.lang = getLang();
  if (configured) await bootRecovery();
  window.addEventListener('hashchange', go);
  go();
  if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => {});
});
