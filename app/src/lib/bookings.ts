import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL, STAFF_KEY } from '@/config';
import { PACKAGES } from '@/data/catalog';
import { Plan } from '@/store/plan';
import { Currency, Lang } from './locale';

export const STATUSES = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Cancelled'] as const;
export type Status = (typeof STATUSES)[number];
export const SOURCES = ['App', 'WhatsApp', 'Phone', 'Walk-in', 'Instagram', 'Email', 'Referral'] as const;

export interface Booking {
  id: string;
  ref: string;
  createdAt: string;
  updatedAt?: string;
  source: string;
  status: Status;
  name: string;
  phone: string;
  email: string;
  company: string;
  occasion: string;
  date: string;
  guests: string;
  emirate: string;
  venue: string;
  seating: string;
  pkgGroup: string;
  pkg: string;
  services: string[];
  budget: string;
  currency: Currency | string;
  language: Lang | string;
  idea: string;
  notes: string;
}

const KEY = 'nilna.bookings.v1';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const newRef = () => {
  const d = new Date();
  return `TE-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

export function bookingFromPlan(plan: Plan, o: { lang: Lang; currency: Currency; budgetLabel: string; source?: string; callback?: boolean }): Booking {
  return {
    id: uid(), ref: newRef(), createdAt: new Date().toISOString(), source: o.source ?? 'App', status: 'New',
    name: plan.name, phone: plan.phone, email: plan.email, company: plan.company,
    occasion: plan.occasion, date: plan.date, guests: plan.guests, emirate: plan.emirate, venue: plan.venue, seating: plan.seating,
    pkgGroup: PACKAGES[plan.group].label, pkg: plan.packageIndex !== null ? PACKAGES[plan.group].list[plan.packageIndex].name : '',
    services: plan.services, budget: o.budgetLabel, currency: o.currency, language: o.lang,
    idea: [plan.idea, o.callback ? 'Please call me back to plan the details.' : ''].filter(Boolean).join(' '),
    notes: '',
  };
}

/** Parse the WhatsApp message the app/website sends, so staff can log it with one paste. */
export function parseWhatsApp(text: string): Booking | null {
  const get = (k: string) => text.match(new RegExp(`^\\s*${k}:\\s*(.+)$`, 'mi'))?.[1].trim() ?? '';
  if (!get('Occasion') && !get('Name')) return null;
  const pk = get('Package');
  const [grp, name] = pk.includes('·') ? pk.split('·').map(s => s.trim()) : ['', pk === 'Not sure yet' ? '' : pk];
  const nm = get('Name');
  const co = nm.match(/\(([^)]+)\)\s*$/);
  const services = get('Services');
  return {
    id: uid(), ref: newRef(), createdAt: new Date().toISOString(), source: 'WhatsApp', status: 'New',
    name: co ? nm.replace(co[0], '').trim() : nm, company: co ? co[1] : '', phone: get('Mobile'), email: get('Email'),
    occasion: get('Occasion'), date: get('Date'), guests: get('Guests'), emirate: get('Emirate'), venue: get('Venue'), seating: get('Seating style'),
    pkgGroup: grp, pkg: name, services: services && services !== 'Please advise' ? services.split(/,\s*/) : [],
    budget: get('Budget'), currency: get('Quote currency') || 'AED', language: get('Preferred language'),
    idea: get('Idea') === '-' ? '' : get('Idea'), notes: '',
  };
}

async function readLocal(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}
const writeLocal = (rows: Booking[]) => AsyncStorage.setItem(KEY, JSON.stringify(rows));

const headers = () => ({ 'Content-Type': 'application/json', ...(STAFF_KEY ? { 'x-staff-key': STAFF_KEY } : {}) });

/** Customers submit here. With a backend the booking goes to the server (central record);
 *  without one it is kept on this device so staff can still log walk-ins on a shop tablet. */
export async function submitBooking(b: Booking): Promise<'server' | 'device'> {
  if (API_URL) {
    try {
      const r = await fetch(`${API_URL}/api/bookings`, { method: 'POST', headers: headers(), body: JSON.stringify(b) });
      if (r.ok) return 'server';
    } catch {}
  }
  const rows = await readLocal();
  await writeLocal([b, ...rows]);
  return 'device';
}

export async function listBookings(): Promise<{ rows: Booking[]; source: 'server' | 'device'; error?: string }> {
  if (API_URL) {
    try {
      const r = await fetch(`${API_URL}/api/bookings`, { headers: headers() });
      if (r.ok) return { rows: (await r.json()) as Booking[], source: 'server' };
      return { rows: await readLocal(), source: 'device', error: r.status === 401 ? 'The server refused the staff key.' : `Server error ${r.status}.` };
    } catch {
      return { rows: await readLocal(), source: 'device', error: "Couldn't reach the server. Showing bookings saved on this device." };
    }
  }
  return { rows: await readLocal(), source: 'device' };
}

export async function saveBooking(b: Booking, mode: 'server' | 'device') {
  const next = { ...b, updatedAt: new Date().toISOString() };
  if (mode === 'server') {
    const r = await fetch(`${API_URL}/api/bookings/${b.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(next) });
    if (!r.ok) throw new Error('save failed');
    return;
  }
  const rows = await readLocal();
  const i = rows.findIndex(x => x.id === b.id);
  if (i >= 0) rows[i] = next; else rows.unshift(next);
  await writeLocal(rows);
}

export async function deleteBooking(id: string, mode: 'server' | 'device') {
  if (mode === 'server') {
    const r = await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE', headers: headers() });
    if (!r.ok) throw new Error('delete failed');
    return;
  }
  await writeLocal((await readLocal()).filter(x => x.id !== id));
}

export function toCsv(rows: Booking[]) {
  const cols: (keyof Booking)[] = ['ref', 'createdAt', 'status', 'source', 'name', 'phone', 'email', 'company', 'language', 'occasion', 'date', 'guests', 'emirate', 'venue', 'seating', 'pkgGroup', 'pkg', 'services', 'budget', 'currency', 'idea', 'notes'];
  const q = (v: unknown) => `"${String(Array.isArray(v) ? v.join('; ') : v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\r\n');
}
