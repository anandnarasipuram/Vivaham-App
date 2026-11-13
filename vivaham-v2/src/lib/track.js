// Usage statistics (PostHog). Records WHAT people do in the app, never what they type:
// screen names, which built-in button was tapped, session times. No names, numbers, amounts or wedding content.
// Off unless VITE_POSTHOG_KEY is set. Nothing is stored on the phone until the person has agreed.
import { S } from './store.js';

const KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const HOST = (import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com').replace(/\/+$/, '');
const SESSION_GAP = 30 * 60 * 1000;   // 30 quiet minutes = a new session
const ls = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } }, del: (k) => { try { localStorage.removeItem(k); } catch { /* */ } } };

// time-ordered random id (UUID v7), the format PostHog expects for sessions
function uuid7() {
  const b = new Uint8Array(16); crypto.getRandomValues(b);
  let ts = Date.now();
  for (let i = 5; i >= 0; i--) { b[i] = ts % 256; ts = Math.floor(ts / 256); }
  b[6] = (b[6] & 0x0f) | 0x70; b[8] = (b[8] & 0x3f) | 0x80;
  const x = [...b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

// ---- agreement: 'yes' | 'no' | null (not asked yet) ----
export const consent = () => ls.get('track');
export const enabled = () => !!KEY && consent() !== 'no';
export function setConsent(yes) {
  ls.set('track', yes ? 'yes' : 'no');
  if (yes) { ls.set('track_id', anon); if (src) ls.set('track_src', src); } else { queue.length = 0; ls.del('track_id'); ls.del('track_sess'); }
}

// ---- who (a random id; the login id after login) and which flyer the QR code came from (?f=1) ----
let anon = ls.get('track_id') || uuid7();
let identified = null;
let src = ls.get('track_src') || '';
try { const f = new URLSearchParams(location.search).get('f'); if (f && !src) src = f.slice(0, 20).replace(/[^\w-]/g, ''); } catch { /* */ }

let sess = null; // { id, last }
function session() {
  const now = Date.now();
  if (!sess) { try { sess = JSON.parse(ls.get('track_sess') || 'null'); } catch { sess = null; } }
  const fresh = !sess || now - sess.last > SESSION_GAP;
  if (fresh) sess = { id: uuid7(), last: now };
  sess.last = now;
  if (consent() === 'yes') ls.set('track_sess', JSON.stringify(sess));
  return { id: sess.id, fresh };
}

const installed = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; } };
const queue = [];
let timer = null, lastScreen = '', screenAt = 0;

export function capture(event, props = {}) {
  if (!enabled()) return;
  const s = session();
  const base = {
    distinct_id: identified || anon, $session_id: s.id, $lib: 'vivaham-web', screen: lastScreen || undefined,
    lang: document.documentElement.lang || 'en', installed: installed(), flyer: src || undefined,
    role: S.wedding?.role, wedding_id: S.wedding?.wedding_id, $screen_width: window.innerWidth, $screen_height: window.innerHeight,
  };
  if (s.fresh && event !== 'session_start') queue.push({ event: 'session_start', properties: { ...base }, timestamp: new Date().toISOString() });
  queue.push({ event, properties: { ...base, ...props }, timestamp: new Date().toISOString() });
  clearTimeout(timer); timer = setTimeout(flush, 500);
}

export function flush() {
  clearTimeout(timer);
  if (!queue.length || !KEY) return;
  const body = JSON.stringify({ api_key: KEY, batch: queue.splice(0) });
  try { fetch(HOST + '/batch/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {}); } catch { /* never break the app */ }
}

// a screen was shown. Same screen redrawn (after a save, live update) is not counted again.
export function screen(name) {
  if (!name || name === lastScreen) return;
  const now = Date.now();
  if (lastScreen) capture('screen_left', { seconds: Math.round((now - screenAt) / 1000) });
  lastScreen = name; screenAt = now;
  capture('$pageview', { $current_url: `${location.origin}/${name}`, $pathname: '/' + name, screen: name });
}

// after login: tie the random id to the login id. Only the role and language are attached, never name or number.
export function identify(userId) {
  if (!userId || identified === userId) return;
  identified = userId;
  capture('$identify', { distinct_id: userId, $anon_distinct_id: anon, $set: { language: document.documentElement.lang || 'en' }, $set_once: { first_flyer: src || 'none' } });
}
export function reset() { identified = null; anon = uuid7(); if (consent() === 'yes') ls.set('track_id', anon); }

// Taps. The button's words are sent only for built-in controls (menu, tiles, buttons, tabs); anything that can hold
// a family's own words (cards, chips with names, list rows) is sent as its kind only.
const WORDS = /^[\p{L}\p{M}\s+&'’\-?!]{1,30}$/u;
const clean = (t) => (t || '').replace(/[\p{Extended_Pictographic}️✓✕✎›←]/gu, '').replace(/\s+/g, ' ').trim();
function describe(el) {
  const hit = el.closest?.('a,button,.card.tap,[role=button]');
  if (!hit) return null;
  const c = hit.classList;
  const kind = hit.closest('.nav') ? 'menu' : c.contains('tile') ? 'tile' : c.contains('fab') ? 'add' : hit.closest('.tabs') ? 'tab'
    : c.contains('back') ? 'back' : c.contains('chk') ? 'tick' : c.contains('chip') ? 'chip' : c.contains('badge') ? 'badge' : c.contains('card') ? 'card'
    : c.contains('link') ? 'link' : (c.contains('btn') || c.contains('hbtn')) ? 'button' : hit.tagName === 'A' ? 'link' : 'other';
  const out = { kind, in_form: !!hit.closest('.sheet') };
  if (['menu', 'tile', 'add', 'tab', 'link', 'button'].includes(kind)) {
    const w = clean(hit.textContent);
    if (WORDS.test(w)) out.label = w;
  }
  if (kind === 'tick') out.ticked = !c.contains('on');
  return out;
}
export function start() {
  if (!KEY) return;
  document.addEventListener('click', (e) => { const d = describe(e.target); if (d) capture('tap', d); }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { capture('app_hidden', { seconds: Math.round((Date.now() - screenAt) / 1000) }); flush(); }
    else { screenAt = Date.now(); capture('app_shown'); }
  });
  window.addEventListener('pagehide', flush);
  window.addEventListener('appinstalled', () => capture('app_installed'));
}
