import { API_URL, BRAND } from '@/config';
import { ALL_SERVICES, GROUP_ORDER, GroupKey, PACKAGES } from '@/data/catalog';
import { Plan } from '@/store/plan';
import { Lang } from './locale';

export type NinaAction =
  | { kind: 'addPackage'; label: string; group: GroupKey; index: number }
  | { kind: 'showGroup'; label: string; group: GroupKey }
  | { kind: 'addService'; label: string; service: string }
  | { kind: 'book'; label: string }
  | { kind: 'browse'; label: string }
  | { kind: 'human'; label: string };

export interface NinaMsg { role: 'user' | 'assistant'; text: string; actions?: NinaAction[] }
export interface NinaReply { text: string; actions: NinaAction[]; addServices?: string[]; showGroup?: GroupKey; live: boolean }

const human: NinaAction = { kind: 'human', label: 'WhatsApp a planner' };

const KEYS: [GroupKey, RegExp][] = [
  ['proposal', /propos|marry|ring|engag|عرض زواج|خطوبة/],
  ['birthday', /birthday|bday|turning \d|عيد ميلاد|anniversaire/],
  ['baby', /baby|shower|gender|newborn|hospital|mubarak|مولود|bébé/],
  ['wedding', /wedding|nikah|henna|mehndi|bride|groom|زفاف|عرس|حناء|mariage/],
  ['opening', /opening|restaurant|caf[eé]|ribbon|افتتاح/],
  ['retail', /mall|supermarket|hypermarket|in-?store|promotion|sampling/],
  ['nationalday', /national day|eid al etihad|2 dec|اليوم الوطني/],
  ['flagday', /flag day|flag raising|3 nov|يوم العلم/],
  ['corporate', /corporate|conference|seminar|gala|award|team ?building|exhibition|summit|company|مؤتمر|شركة/],
  ['social', /graduat|anniversar|housewarming|surprise party|hen party|تخرج/],
];

/** Built-in answers, used when no AI backend is configured or it can't be reached. */
export function offlineReply(text: string): NinaReply {
  const s = text.toLowerCase();
  if (/human|person|agent|call|speak|talk to|manager|complain|موظف|شخص/.test(s)) {
    return { text: "Of course. A NILNA planner will continue with you on WhatsApp, and I'll send your plan along.", actions: [human], live: false };
  }
  if (/price|cost|how much|budget|aed|usd|\$|cheap|rate|سعر|كم/.test(s)) {
    return {
      text: 'Every event is quoted individually, based on date, venue, guests and services, so you only pay for what you need. Pick a package and a planner sends an itemised quote in AED or USD, usually within 24 hours.',
      actions: [{ kind: 'book', label: 'Start booking' }, human], live: false,
    };
  }
  const hit = KEYS.find(([, re]) => re.test(s));
  if (hit) {
    const g = hit[0];
    const grp = PACKAGES[g];
    return {
      text: `Lovely! For ${grp.label.toLowerCase()} we have:\n${grp.list.map(p => `• ${p.name}: ${p.for}`).join('\n')}\n\nWhich feels closest? I can add it to your plan.`,
      actions: [...grp.list.map((p, i) => ({ kind: 'addPackage' as const, label: `Add ${p.name}`, group: g, index: i })), { kind: 'showGroup', label: 'See details', group: g }],
      showGroup: g, live: false,
    };
  }
  const words = s.split(/\W+/).filter(w => w.length > 3);
  const found = ALL_SERVICES.filter(n => words.some(w => n.toLowerCase().includes(w))).slice(0, 6);
  if (found.length) {
    return { text: 'Yes, we can do that. These services match:', actions: [...found.map(n => ({ kind: 'addService' as const, label: `+ ${n}`, service: n })), human], live: false };
  }
  return {
    text: "I'd love to help. Tell me the occasion, a rough date and how many guests, or a planner can answer straight away on WhatsApp.",
    actions: [{ kind: 'browse', label: 'Browse services' }, human], live: false,
  };
}

/** Ask the live AI through the NILNA server (see /server). Falls back to built-in answers. */
export async function askNina(history: NinaMsg[], plan: Plan, lang: Lang, signal?: AbortSignal): Promise<NinaReply> {
  const last = history[history.length - 1]?.text ?? '';
  if (!API_URL) return offlineReply(last);
  try {
    const r = await fetch(`${API_URL}/api/nina`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        messages: history.slice(-12).map(m => ({ role: m.role, content: m.text })),
        context: { lang, occasion: plan.occasion, date: plan.date, guests: plan.guests, emirate: plan.emirate, services: plan.services },
      }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { reply: string; show_group?: string; add_services?: string[]; talk_to_human?: boolean; open_booking?: boolean };
    const actions: NinaAction[] = [];
    const g = GROUP_ORDER.find(k => k === j.show_group);
    if (g) actions.push(...PACKAGES[g].list.map((p, i) => ({ kind: 'addPackage' as const, label: `Add ${p.name}`, group: g, index: i })));
    if (j.open_booking) actions.push({ kind: 'book', label: 'Open booking' });
    if (j.talk_to_human) actions.push(human);
    const add = (j.add_services ?? []).filter(n => ALL_SERVICES.includes(n));
    return { text: j.reply, actions, addServices: add, showGroup: g, live: true };
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    const off = offlineReply(last);
    return { ...off, text: off.text };
  }
}

export const NINA_SUGGESTIONS = [
  'Plan a surprise proposal on a yacht',
  'Office birthday for 20 people',
  'Welcome baby setup at the hospital',
  'National Day décor for our office',
  'Restaurant grand opening ideas',
];

export const HUMAN_CONTACT = BRAND.whatsappDisplay;
