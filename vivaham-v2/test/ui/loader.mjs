import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
const mock = pathToFileURL(new URL('./mock-supabase.mjs', import.meta.url).pathname).href;
export async function resolve(spec, ctx, next) {
  if (/(^|\/)supabase\.js$/.test(spec)) return { url: mock, shortCircuit: true };
  if (spec.endsWith('.css')) return { url: 'data:text/javascript,export default 1', shortCircuit: true };
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.startsWith('file:') && url.includes('/src/') && url.endsWith('.js')) {
    const src = fs.readFileSync(fileURLToPath(url), 'utf8').replaceAll('import.meta.env', 'globalThis.__env');
    return { format: 'module', source: src, shortCircuit: true };
  }
  return next(url, ctx);
}
