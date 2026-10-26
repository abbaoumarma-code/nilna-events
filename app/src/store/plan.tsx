import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { GroupKey, PACKAGES, occasionGroup } from '@/data/catalog';
import { BUDGETS, Currency, Lang } from '@/lib/locale';

export interface Plan {
  occasion: string;
  group: GroupKey;
  packageIndex: number | null;
  services: string[];
  date: string; // YYYY-MM-DD
  flexibleDate: boolean;
  guests: string;
  emirate: string;
  venue: string;
  seating: string;
  budgetIndex: number;
  idea: string;
  name: string;
  phone: string;
  email: string;
  company: string;
}

const emptyPlan = (): Plan => ({
  occasion: 'Birthday',
  group: 'birthday',
  packageIndex: null,
  services: [],
  date: '',
  flexibleDate: false,
  guests: '30 – 100',
  emirate: 'Dubai',
  venue: 'Not decided',
  seating: 'Not sure',
  budgetIndex: 0,
  idea: '',
  name: '',
  phone: '',
  email: '',
  company: '',
});

interface Ctx {
  plan: Plan;
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  update: (patch: Partial<Plan>) => void;
  setOccasion: (name: string) => void;
  choosePackage: (group: GroupKey, index: number | null) => void;
  toggleService: (name: string, force?: boolean) => boolean;
  reset: () => void;
  packageName: string | null;
  budgetLabel: string;
  itemCount: number;
}

const PlanContext = createContext<Ctx | null>(null);
const SETTINGS_KEY = 'nilna.settings.v1';

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [lang, setLangState] = useState<Lang>('English');
  const [currency, setCurrencyState] = useState<Currency>('AED');

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then(raw => {
        if (!raw) return;
        const s = JSON.parse(raw) as { lang?: Lang; currency?: Currency };
        if (s.lang) setLangState(s.lang);
        if (s.currency) setCurrencyState(s.currency);
      })
      .catch(() => {});
  }, []);

  const persist = (next: { lang: Lang; currency: Currency }) =>
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});

  const setLang = useCallback((l: Lang) => { setLangState(l); persist({ lang: l, currency }); }, [currency]);
  const setCurrency = useCallback((c: Currency) => { setCurrencyState(c); persist({ lang, currency: c }); }, [lang]);
  const update = useCallback((patch: Partial<Plan>) => setPlan(p => ({ ...p, ...patch })), []);

  const setOccasion = useCallback((name: string) => {
    setPlan(p => {
      const g = occasionGroup(name);
      return { ...p, occasion: name, group: g, packageIndex: g === p.group ? p.packageIndex : null };
    });
  }, []);

  const choosePackage = useCallback((group: GroupKey, index: number | null) => {
    setPlan(p => {
      let occasion = p.occasion;
      if (occasionGroup(occasion) !== group) {
        // keep the occasion in step with the chosen package group
        const map: Partial<Record<GroupKey, string>> = {
          wedding: 'Wedding', proposal: 'Surprise Proposal', birthday: 'Birthday', baby: 'Baby Shower', social: 'Graduation',
          opening: 'Grand Opening', retail: 'Mall & Supermarket', nationalday: 'UAE National Day', flagday: 'UAE Flag Day', corporate: 'Corporate Event',
        };
        occasion = map[group] ?? occasion;
      }
      return { ...p, group, packageIndex: index, occasion };
    });
  }, []);

  const toggleService = useCallback((name: string, force?: boolean) => {
    let added = false;
    setPlan(p => {
      const has = p.services.includes(name);
      if (force && has) return p;
      added = !has;
      return { ...p, services: has ? p.services.filter(s => s !== name) : [...p.services, name] };
    });
    return added;
  }, []);

  const reset = useCallback(() => setPlan(p => ({ ...emptyPlan(), name: p.name, phone: p.phone, email: p.email })), []);

  const value = useMemo<Ctx>(() => ({
    plan, lang, currency, setLang, setCurrency, update, setOccasion, choosePackage, toggleService, reset,
    packageName: plan.packageIndex !== null ? PACKAGES[plan.group].list[plan.packageIndex]?.name ?? null : null,
    budgetLabel: BUDGETS[currency][plan.budgetIndex] ?? BUDGETS[currency][0],
    itemCount: (plan.packageIndex !== null ? 1 : 0) + plan.services.length,
  }), [plan, lang, currency, setLang, setCurrency, update, setOccasion, choosePackage, toggleService, reset]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider');
  return ctx;
}
