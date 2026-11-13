import { S, canEdit } from '../lib/store.js';
import { h } from '../lib/ui.js';
import { t } from '../lib/i18n.js';
import { page, startRealtime } from '../main.js';
import { daysUntil, fmtDate, fmtShort, todayStr } from '../lib/format.js';
import { consent, setConsent } from '../lib/track.js';
import { installCard } from '../lib/install.js';

const TILES = [['events', '🪔', 'Events'], ['shopping', '🛍️', 'Shopping'], ['budget', '💰', 'Budget'], ['stays', '🏨', 'Stays'], ['guests', '👥', 'Guests'], ['food', '🍛', 'Food'], ['transport', '🚗', 'Transport'], ['vendors', '💐', 'Vendors']];

// people who were already logged in before usage statistics existed are asked once
const askStats = (redraw) => (consent() != null || !import.meta.env.VITE_POSTHOG_KEY ? null : h('div', { class: 'card' },
  h('b', null, t('Help improve Vivaham')),
  h('div', { class: 'mute', style: 'margin:4px 0 10px' }, t('May we record how the app is used (screens and taps)? Never what you type.')),
  h('div', { class: 'row' }, h('button', { class: 'btn sm', onclick: () => { setConsent(true); redraw(); } }, t('OK')),
    h('button', { class: 'btn sm ghost', onclick: () => { setConsent(false); redraw(); } }, t('No thanks')),
    h('button', { class: 'link', onclick: () => (location.hash = '#/privacy') }, t('Privacy notice')))));

export async function render(_p, refresh) {
  startRealtime();
  const w = S.wedding, d = daysUntil(w.wedding_date);
  const tiles = TILES.filter(([k]) => k !== 'budget' || canEdit()); // helpers never see budget
  const upcoming = S.events.filter((e) => !e.event_date || e.event_date >= todayStr()).slice(0, 5);
  page({ title: w.name, sub: `${w.wedding_date ? fmtDate(w.wedding_date) : ''}` },
    h('div', { class: 'count' },
      d == null ? h('div', null, t('Set the wedding date in Profile')) :
      d > 0 ? [h('div', { class: 'n' }, d), h('div', null, t('days to go'))] :
      d === 0 ? h('div', { class: 'n', style: 'font-size:34px' }, t('Today is the day! 🎉')) : h('div', null, t('Congratulations! 🎉'))),
    installCard(refresh), askStats(refresh),
    h('div', { class: 'tiles' }, ...tiles.map(([k, i, l]) => h('a', { class: 'tile', href: '#/' + k }, h('span', { class: 'i' }, i), t(l)))),
    upcoming.length ? h('div', { class: 'sec' }, t('Coming up')) : null,
    ...upcoming.map((e) => h('a', { class: 'card tap row between', href: '#/events/' + e.id, style: 'text-decoration:none;color:inherit' },
      h('div', null, h('b', null, e.type), h('div', { class: 'mute' }, [fmtShort(e.event_date), e.venue_name].filter(Boolean).join(' · '))), h('span', null, '›'))));
}
