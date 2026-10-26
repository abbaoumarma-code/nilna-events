// Reads the app's catalogue (src/data/catalog.ts) so the server and app always share one list of packages and services.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, '..', 'src', 'data', 'catalog.ts'), 'utf8');

const block = name => {
  const m = src.match(new RegExp(`export const ${name}[^=]*=\\s*([\\[{][\\s\\S]*?[\\]}]);\\n`));
  if (!m) throw new Error(`catalog: ${name} not found`);
  return JSON.parse(m[1]);
};

const CATEGORIES = block('CATEGORIES');
const PACKAGES = block('PACKAGES');

export const GROUPS = Object.keys(PACKAGES);
export const SERVICES = CATEGORIES.flatMap(c => c.services.map(s => s.name));
export const catalogText = [
  'PACKAGES',
  ...GROUPS.map(k => `${PACKAGES[k].label} [${k}]: ${PACKAGES[k].list.map(p => `${p.name} (${p.for}: ${p.includes.slice(0, 4).join(', ')})`).join(' | ')}`),
  '',
  'SERVICES',
  ...CATEGORIES.map(c => `${c.name}: ${c.services.map(s => s.name).join('; ')}`),
].join('\n');
