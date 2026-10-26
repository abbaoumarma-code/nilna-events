// NILNA Events server: live AI for Nina + a central bookings store for the staff dashboard.
// Run:  cd server && npm install && cp .env.example .env  (fill it in)  &&  npm start
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { catalogText, GROUPS, SERVICES } from './catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const STAFF_KEY = process.env.STAFF_KEY || '';
const MODEL = process.env.NINA_MODEL || 'claude-sonnet-5-5';
const DATA = path.join(__dirname, 'data', 'bookings.json');
const WHATSAPP = process.env.WHATSAPP_DISPLAY || '+971 58 564 9298';

if (!process.env.ANTHROPIC_API_KEY) console.warn('ANTHROPIC_API_KEY is not set: /api/nina will return 503 and the app falls back to built-in answers.');
if (!STAFF_KEY) console.warn('STAFF_KEY is not set: anyone who can reach this server can read bookings. Set it before going live.');

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

/* ---------------- bookings ---------------- */
async function readAll() {
  try { return JSON.parse(await readFile(DATA, 'utf8')); } catch { return []; }
}
async function writeAll(rows) {
  await mkdir(path.dirname(DATA), { recursive: true });
  await writeFile(DATA, JSON.stringify(rows, null, 2));
}
const staffOnly = (req, res, next) => {
  if (STAFF_KEY && req.get('x-staff-key') !== STAFF_KEY) return res.status(401).json({ error: 'staff key required' });
  next();
};
const clean = b => {
  const s = v => (typeof v === 'string' ? v.slice(0, 2000) : '');
  return {
    id: s(b.id) || randomUUID(), ref: s(b.ref), createdAt: s(b.createdAt) || new Date().toISOString(), updatedAt: new Date().toISOString(),
    source: s(b.source) || 'App', status: ['New', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Cancelled'].includes(b.status) ? b.status : 'New',
    name: s(b.name), phone: s(b.phone), email: s(b.email), company: s(b.company), occasion: s(b.occasion), date: s(b.date), guests: s(b.guests),
    emirate: s(b.emirate), venue: s(b.venue), seating: s(b.seating), pkgGroup: s(b.pkgGroup), pkg: s(b.pkg),
    services: Array.isArray(b.services) ? b.services.filter(x => typeof x === 'string').slice(0, 60) : [],
    budget: s(b.budget), currency: s(b.currency), language: s(b.language), idea: s(b.idea), notes: s(b.notes),
  };
};

// Customers create bookings (no key needed); everything else is staff only.
app.post('/api/bookings', async (req, res) => {
  const b = clean(req.body || {});
  if (!b.name || (!b.phone && !b.email)) return res.status(400).json({ error: 'name and phone or email are required' });
  const rows = await readAll();
  if (rows.some(r => r.id === b.id)) return res.status(409).json({ error: 'duplicate' });
  rows.unshift(b);
  await writeAll(rows);
  res.status(201).json({ id: b.id, ref: b.ref });
});
app.get('/api/bookings', staffOnly, async (_req, res) => res.json(await readAll()));
app.put('/api/bookings/:id', staffOnly, async (req, res) => {
  const rows = await readAll();
  const i = rows.findIndex(r => r.id === req.params.id);
  const b = clean({ ...(i >= 0 ? rows[i] : {}), ...req.body, id: req.params.id });
  if (i >= 0) rows[i] = b; else rows.unshift(b);
  await writeAll(rows);
  res.json(b);
});
app.delete('/api/bookings/:id', staffOnly, async (req, res) => {
  const rows = await readAll();
  await writeAll(rows.filter(r => r.id !== req.params.id));
  res.status(204).end();
});

/* ---------------- Nina ---------------- */
const system = ctx => `You are Nina, the AI event planner in the NILNA Events app (NILNA Events is an event planning and decoration company in Dubai, UAE).
Speak warmly and briefly, like a skilled Dubai event planner. Reply in the visitor's language; their chosen language is ${ctx.lang || 'English'}.
Rules:
- Keep "reply" under 90 words, plain text, at most one question.
- Only recommend packages and services from the catalogue below. Never invent prices, discounts, venues or availability. Prices are quoted per event by a human planner in AED or USD.
- Human planners: WhatsApp ${WHATSAPP}, email info@nilnaevents.com. Coverage: all seven emirates. Planners speak Arabic, English, Hindi, Urdu and French.
- UAE dates: Flag Day is 3 November (flag raising at 11am); National Day (Eid Al Etihad) is 2 December.
- Visitor's plan so far: occasion ${ctx.occasion || 'unknown'}; date ${ctx.date || 'unknown'}; guests ${ctx.guests || 'unknown'}; emirate ${ctx.emirate || 'unknown'}; services ${(ctx.services || []).join(', ') || 'none'}.
Respond with ONLY a JSON object, no other text:
{"reply": string, "show_group": one of ${JSON.stringify(GROUPS)} or null, "add_services": [exact service names from the catalogue], "talk_to_human": boolean, "open_booking": boolean}
Set talk_to_human when they ask for a person, a price, a confirmation, have a complaint, or you cannot help. Set open_booking when they seem ready to book.

CATALOGUE
${catalogText}`;

const parseJson = t => {
  try { return JSON.parse(t); } catch {}
  const m = t.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return { reply: t };
};

app.post('/api/nina', async (req, res) => {
  if (!anthropic) return res.status(503).json({ error: 'AI not configured' });
  const { messages = [], context = {} } = req.body || {};
  const turns = messages
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return res.status(400).json({ error: 'last message must be from the user' });
  try {
    const msg = await anthropic.messages.create({ model: MODEL, max_tokens: 600, system: system(context), messages: turns });
    const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const j = parseJson(text);
    res.json({
      reply: String(j.reply || "I'd love to help. Could you tell me a little more about your event?"),
      show_group: GROUPS.includes(j.show_group) ? j.show_group : null,
      add_services: Array.isArray(j.add_services) ? j.add_services.filter(s => SERVICES.includes(s)) : [],
      talk_to_human: !!j.talk_to_human,
      open_booking: !!j.open_booking,
    });
  } catch (e) {
    console.error('Nina error:', e?.status || '', e?.message || e);
    res.status(502).json({ error: 'AI request failed' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, ai: !!anthropic }));
app.listen(PORT, () => console.log(`NILNA Events server on http://localhost:${PORT}`));
