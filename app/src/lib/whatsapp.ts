import * as Linking from 'expo-linking';

import { BRAND } from '@/config';
import { PACKAGES } from '@/data/catalog';
import { Plan } from '@/store/plan';
import { Currency, Lang } from './locale';

export function planMessage(plan: Plan, opts: { lang: Lang; currency: Currency; budgetLabel: string; callback?: boolean }) {
  const pkg = plan.packageIndex !== null ? `${PACKAGES[plan.group].label} · ${PACKAGES[plan.group].list[plan.packageIndex].name}` : 'Not sure yet';
  const lines = [
    "Hi NILNA Events, I'd like to plan an event.",
    `Occasion: ${plan.occasion}`,
    `Date: ${plan.date || 'TBC'}${plan.flexibleDate ? ' (flexible)' : ''}`,
    `Guests: ${plan.guests}`,
    `Emirate: ${plan.emirate}`,
    `Venue: ${plan.venue}`,
    ...(plan.group === 'corporate' || plan.seating !== 'Not sure' ? [`Seating style: ${plan.seating}`] : []),
    `Package: ${pkg}`,
    `Services: ${plan.services.length ? plan.services.join(', ') : 'Please advise'}`,
    `Budget: ${opts.budgetLabel}`,
    `Preferred language: ${opts.lang}`,
    `Quote currency: ${opts.currency}`,
    `Idea: ${[plan.idea, opts.callback ? 'Please call me back to plan the details.' : ''].filter(Boolean).join(' ') || '-'}`,
    ...(plan.name ? [`Name: ${plan.name}${plan.company ? ` (${plan.company})` : ''}`, `Mobile: ${plan.phone}`] : []),
    ...(plan.email ? [`Email: ${plan.email}`] : []),
  ];
  return lines.join('\n');
}

export const waLink = (text?: string, to = BRAND.whatsapp) =>
  `https://wa.me/${to}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/** Turn a local UAE number (050…, 50…, 00971…) into WhatsApp's international format. */
export function toWaNumber(phone: string) {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '971' + d.slice(1);
  if (d.length === 9 && d.startsWith('5')) d = '971' + d;
  return d;
}

export async function openWhatsApp(text?: string, to?: string) {
  try {
    await Linking.openURL(waLink(text, to));
    return true;
  } catch {
    return false;
  }
}

export const isPhone = (s: string) => /^\+?[\d\s-]{8,16}$/.test(s.trim());
