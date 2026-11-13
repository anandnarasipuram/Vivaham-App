import { t } from './i18n.js';
import { capture } from './track.js';

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
}
export const clear = (el) => { el.textContent = ''; return el; };

let toastT;
export function toast(msg, err) {
  document.querySelectorAll('.toast').forEach((x) => x.remove());
  const el = h('div', { class: 'toast' + (err ? ' err' : '') }, msg);
  document.body.append(el);
  clearTimeout(toastT);
  toastT = setTimeout(() => el.remove(), err ? 5000 : 2200);
}
export const fail = (e) => { console.error(e); toast(e?.message || String(e), true); };

// bottom sheet
export function sheet(title, build) {
  const ov = h('div', { class: 'ov', onclick: (e) => e.target === ov && close() });
  const box = h('div', { class: 'sheet' });
  ov.append(box);
  const close = () => ov.remove();
  document.body.append(ov);
  if (title) box.append(h('h2', null, title));
  build(box, close);
  return close;
}
export function confirmBox(msg, onYes, yesLabel = 'Delete') {
  sheet('', (box, close) => {
    box.append(h('p', { style: 'font-size:17px;margin:4px 0 18px' }, msg),
      h('div', { class: 'row' },
        h('button', { class: 'btn ghost', onclick: close }, t('Cancel')),
        h('button', { class: 'btn danger', onclick: async () => { close(); await onYes(); } }, t(yesLabel))));
  });
}

// ---------- forms ----------
// fields: {k,label,type,opts,req,show,placeholder,custom,suggest,step,min}
// types: text textarea number date time tel url chips multi toggle tags node
const optv = (o) => (typeof o === 'object' ? o.v : o);
const optl = (o) => t(typeof o === 'object' ? o.l : o);

export function openForm({ title, fields, values = {}, onSave, onDelete, saveLabel = 'Save', extra, trackAs }) {
  const v = { ...values };
  const form = trackAs || title;   // a built-in title such as 'Add guest'; never a person's name
  capture('form_opened', { form });
  sheet(title, (box, close) => {
    const body = h('div');
    const redraw = () => { clear(body); fields.forEach((f) => { if (!f.show || f.show(v)) body.append(renderField(f, v, redraw)); }); };
    redraw();
    box.append(body);
    if (extra) box.append(extra(v, redraw));
    const save = h('button', { class: 'btn', onclick: async () => {
      for (const f of fields) {
        if (f.show && !f.show(v)) continue;
        if (f.req && (v[f.k] == null || String(v[f.k]).trim() === '' || (Array.isArray(v[f.k]) && !v[f.k].length))) { toast(`${t(f.label)} ?`, true); return; }
      }
      save.disabled = true;
      try { await onSave(v); capture('form_saved', { form }); close(); } catch (e) { capture('form_failed', { form }); fail(e); save.disabled = false; }
    } }, t(saveLabel));
    box.append(h('div', { style: 'margin-top:8px' }, save));
    box.append(h('div', { class: 'row', style: 'margin-top:10px' },
      h('button', { class: 'btn ghost', onclick: close }, t('Cancel')),
      onDelete && h('button', { class: 'btn danger', onclick: () => confirmBox('Delete this?', async () => { try { await onDelete(); capture('form_deleted', { form }); close(); } catch (e) { fail(e); } }) }, t('Delete'))));
  });
}

function renderField(f, v, redraw) {
  const lab = (n) => h('label', { class: 'f' }, h('span', null, t(f.label) + (f.req ? ' *' : '')), n, f.hint && h('div', { class: 'mute', style: 'margin-top:4px' }, f.hint));
  const k = f.k;
  switch (f.type) {
    case 'textarea':
      return lab(h('textarea', { class: 'inp', value: v[k] ?? '', placeholder: f.placeholder, oninput: (e) => (v[k] = e.target.value) }));
    case 'number':
      return lab(h('input', { class: 'inp', type: 'number', inputMode: 'numeric', min: f.min ?? 0, value: v[k] ?? '', placeholder: f.placeholder, oninput: (e) => { v[k] = e.target.value === '' ? null : Number(e.target.value); if (f.live) f.live(v); } }));
    case 'date': case 'time': case 'tel': case 'url': case 'text': default:
      if (['date', 'time', 'tel', 'url', 'text'].includes(f.type || 'text'))
        return lab(h('input', { class: 'inp', type: f.type || 'text', value: v[k] ?? '', placeholder: f.placeholder, oninput: (e) => (v[k] = e.target.value) }));
    case 'chips': {
      const wrap = h('div', { class: 'chips' });
      const opts = [...f.opts];
      const cur = v[k];
      if (f.custom && cur && !opts.some((o) => optv(o) === cur)) opts.push(cur);
      opts.forEach((o) => wrap.append(h('button', { type: 'button', class: 'chip' + (optv(o) === v[k] ? ' on' : ''), onclick: () => { v[k] = optv(o); redraw(); } }, optl(o))));
      if (f.custom) wrap.append(h('button', { type: 'button', class: 'chip add', onclick: () => {
        const n = (prompt(t('Own name') + ':') || '').trim();
        if (n) { v[k] = n; f.onCustom && f.onCustom(n); redraw(); }
      } }, '+ ' + t('Own')));
      return lab(wrap);
    }
    case 'multi': {
      v[k] = v[k] || [];
      const wrap = h('div', { class: 'chips' });
      if (!f.opts.length) wrap.append(h('span', { class: 'mute' }, f.empty || '—'));
      f.opts.forEach((o) => { const id = optv(o); const on = v[k].includes(id);
        wrap.append(h('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), onclick: () => { v[k] = on ? v[k].filter((x) => x !== id) : [...v[k], id]; redraw(); } }, optl(o))); });
      return lab(wrap);
    }
    case 'toggle':
      return h('label', { class: 'f row between' }, h('span', { style: 'margin:0' }, t(f.label)),
        h('button', { type: 'button', class: 'chip' + (v[k] ? ' on' : ''), onclick: () => { v[k] = !v[k]; redraw(); } }, v[k] ? t('Yes') : t('No')));
    case 'tags': {
      v[k] = v[k] || [];
      const wrap = h('div');
      const chips = h('div', { class: 'chips', style: 'margin-bottom:8px' });
      const draw = () => { clear(chips);
        (f.suggest || []).filter((s) => !v[k].includes(s)).forEach((s) => chips.append(h('button', { type: 'button', class: 'chip add', onclick: () => { v[k].push(s); draw(); } }, '+ ' + s)));
        v[k].forEach((s) => chips.append(h('button', { type: 'button', class: 'chip on', onclick: () => { v[k] = v[k].filter((x) => x !== s); draw(); } }, s + ' ✕'))); };
      const inp = h('input', { class: 'inp', placeholder: f.placeholder || t('Type and press Add'), onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); addIt(); } } });
      const addIt = () => { const s = inp.value.trim(); if (s && !v[k].includes(s)) v[k].push(s); inp.value = ''; draw(); };
      draw();
      wrap.append(chips, h('div', { class: 'row' }, inp, h('button', { type: 'button', class: 'btn sm', onclick: addIt }, t('Add'))));
      return lab(wrap);
    }
    case 'node':
      return f.render(v, redraw);
  }
}

// Price block used on every add screen: price + (no / advance / full) + who/how/when
import { S } from './store.js';
import { todayStr } from './format.js';
export function priceField(show = () => true) {
  return { k: '_price', type: 'node', show, render: (v, redraw) => {
    v.mode = v.mode || 'no';
    const box = h('div', { class: 'price' }, h('div', { class: 'lbl' }, '₹ ' + t('Price')));
    box.append(h('input', { class: 'inp', type: 'number', inputMode: 'numeric', min: 0, placeholder: t('Total price'), value: v.price ?? '', style: 'margin-bottom:10px', oninput: (e) => (v.price = e.target.value === '' ? null : Number(e.target.value)) }));
    const chips = h('div', { class: 'chips', style: 'margin-bottom:10px' });
    [['no', 'Not paid yet'], ['adv', 'Paid advance'], ['full', 'Paid in full']].forEach(([m, l]) =>
      chips.append(h('button', { type: 'button', class: 'chip' + (v.mode === m ? ' on' : ''), onclick: () => { v.mode = m; redraw(); } }, t(l))));
    box.append(chips);
    if (v.mode !== 'no') {
      if (v.mode === 'adv') box.append(h('label', { class: 'f' }, h('span', null, t('Advance amount')), h('input', { class: 'inp', type: 'number', inputMode: 'numeric', min: 0, value: v.advance ?? '', oninput: (e) => (v.advance = e.target.value === '' ? null : Number(e.target.value)) })));
      box.append(h('label', { class: 'f' }, h('span', null, t('Paid by')),
        h('select', { class: 'inp', onchange: (e) => (v.paid_by = e.target.value || null) }, h('option', { value: '' }, '—'), ...S.members.map((m) => h('option', { value: m.id, selected: m.id === v.paid_by }, m.name)))));
      const mc = h('div', { class: 'chips', style: 'margin-bottom:12px' });
      [['cash', 'Cash'], ['upi', 'UPI'], ['card', 'Card'], ['bank', 'Bank transfer']].forEach(([m, l]) =>
        mc.append(h('button', { type: 'button', class: 'chip' + ((v.method || 'upi') === m ? ' on' : ''), onclick: () => { v.method = m; redraw(); } }, t(l))));
      box.append(h('div', { class: 'lbl' }, t('How')), mc);
      box.append(h('label', { class: 'f', style: 'margin:0' }, h('span', null, t('Paid on')), h('input', { class: 'inp', type: 'date', value: v.paid_on || todayStr(), oninput: (e) => (v.paid_on = e.target.value) })));
    }
    return box;
  } };
}
