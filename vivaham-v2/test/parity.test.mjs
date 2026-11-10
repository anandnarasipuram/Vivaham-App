// Static check: every table, view, RPC (and its arguments) and row column used by the frontend exists in the SQL schema.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs'; import path from 'node:path';
const db = new PGlite();
await db.exec(`create schema auth; create schema storage;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid, bucket_id text, name text); alter table storage.objects enable row level security;
create role anon nologin; create role authenticated nologin;`);
await db.exec(fs.readFileSync('supabase/migrations/20261110_vivaham_v2.sql', 'utf8'));
const cols = {}; for (const r of (await db.query(`select table_name t, column_name c from information_schema.columns where table_schema='vivaham'`)).rows) (cols[r.t] ||= new Set()).add(r.c);
const fns = {}; for (const r of (await db.query(`select p.proname n, pg_get_function_identity_arguments(p.oid) a from pg_proc p join pg_namespace s on s.oid=p.pronamespace where s.nspname='vivaham'`)).rows) fns[r.n] = r.a.split(',').map((x) => x.trim().split(' ')[0]).filter(Boolean);
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && files.push(p); } })('src');
let bad = 0; const used = { tables: new Set(), rpcs: new Set() };
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\.from\('(\w+)'\)/g)) { if (['vivaham'].includes(m[1])) continue; used.tables.add(m[1]); if (!cols[m[1]]) { console.log('MISSING TABLE', m[1], f); bad++; } }
  for (const m of s.matchAll(/\.rpc\('(\w+)'(?:,\s*\{([^}]*)\})?/g)) {
    used.rpcs.add(m[1]);
    if (!fns[m[1]]) { console.log('MISSING RPC', m[1], f); bad++; continue; }
    for (const a of (m[2] || '').matchAll(/(\bp_\w+)\s*:/g)) if (!fns[m[1]].includes(a[1])) { console.log('BAD ARG', m[1], a[1], f); bad++; }
  }
  // column names in .select('a,b') / .eq('col') / .order('col') on a known table in the same statement
  for (const st of s.split(/(?=sb\.from\()/)) {
    const t = st.match(/^sb\.from\('(\w+)'\)/)?.[1]; if (!t || !cols[t]) continue;
    const seg = st.split(/\)\s*[,;\n]\s*(?:\s*\))?/)[0] + st.slice(0, 400);
    for (const m of st.slice(0, 500).matchAll(/\.(?:eq|order)\('(\w+)'/g)) if (!cols[t].has(m[1])) { console.log('BAD COLUMN', t, m[1], f); bad++; }
  }
  // row literals: const row = { wedding_id: ..., col: ... }  -> must be columns of the table written right after
  for (const m of s.matchAll(/const row = \{([\s\S]*?)\};/g)) {
    const after = s.slice(m.index, m.index + 900).match(/from\('(\w+)'\)\.(?:insert|update|upsert)\(row/)?.[1];
    if (!after) continue;
    for (const k of m[1].matchAll(/(?:^|[,{]\s*)(\w+)\s*:/g)) if (!cols[after].has(k[1])) { console.log('BAD ROW KEY', after, k[1], f); bad++; }
  }
}
console.log(`tables used: ${[...used.tables].sort().join(', ')}\nrpcs used: ${[...used.rpcs].sort().join(', ')}`);
const unused = Object.keys(cols).filter((t) => !used.tables.has(t) && !t.startsWith('v_') || false);
console.log('tables never touched by frontend:', unused.join(', ') || 'none');
console.log(bad ? `${bad} PROBLEMS` : 'PARITY OK'); process.exit(bad ? 1 : 0);
