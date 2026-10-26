import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/chrome';
import { Btn, ChipRow, Hand, H, Label, LinkText, P, Sticky, useToast } from '@/components/ui';
import { BRAND } from '@/config';
import { OCCASIONS, PACKAGES, SERVICE_COUNT } from '@/data/catalog';
import { bookingFromPlan, submitBooking } from '@/lib/bookings';
import { BUDGETS, EMIRATES, GUESTS, SEATING, VENUES } from '@/lib/locale';
import { isPhone, openWhatsApp, planMessage } from '@/lib/whatsapp';
import { usePlan } from '@/store/plan';
import { C, F, sticker } from '@/theme';

const STEPS = ['Occasion', 'Date & guests', 'Package', 'Your details'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Book() {
  const ctx = usePlan();
  const { plan, update, setOccasion, choosePackage, lang, currency, budgetLabel } = ctx;
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [quick, setQuick] = useState(false);
  const [sent, setSent] = useState<null | { msg: string; where: 'server' | 'device' }>(null);
  const [err, setErr] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const quickDates = useMemo(() => {
    const t = new Date();
    const sat = new Date(t); sat.setDate(t.getDate() + (((6 - t.getDay() + 7) % 7) || 7));
    return [['This weekend', iso(sat)], ['In 2 weeks', iso(new Date(+t + 14 * 864e5))], ['Next month', iso(new Date(t.getFullYear(), t.getMonth() + 1, 15))]] as const;
  }, []);

  const finish = async (callback = false) => {
    setErr('');
    if (plan.name.trim().length < 2) return setErr('Please add your name so we know who to ask for.');
    if (!isPhone(plan.phone)) return setErr('Please add a WhatsApp number, for example 050 123 4567.');
    const msg = planMessage(plan, { lang, currency, budgetLabel, callback });
    const where = await submitBooking(bookingFromPlan(plan, { lang, currency, budgetLabel, callback }));
    setSent({ msg, where });
    setQuick(false);
  };

  /* ---------- done ---------- */
  if (sent) {
    return (
      <Screen>
        <View style={[styles.card, sticker(6), { alignItems: 'center' }]}>
          <View style={[styles.tick, sticker(3)]}><Ionicons name="checkmark" size={36} color={C.waInk} /></View>
          <Hand size={24}>Almost done</Hand>
          <H size={34} style={{ textAlign: 'center', marginTop: 4 }}>Thank you, {plan.name.split(' ')[0]}!</H>
          <P style={{ textAlign: 'center', marginTop: 10 }}>Tap the green button to send your request. A planner replies on WhatsApp{lang !== 'English' ? ` in ${lang}` : ''}, usually within the hour.</P>
          <View style={[styles.row, { justifyContent: 'center', marginTop: 20 }]}>
            <Btn kind="wa" icon="logo-whatsapp" title="Send on WhatsApp" onPress={async () => { if (!(await openWhatsApp(sent.msg))) toast(`Couldn't open WhatsApp. Message ${BRAND.whatsappDisplay}`); }} />
            <Btn title="Copy details" onPress={async () => { await Clipboard.setStringAsync(sent.msg); toast('Details copied'); }} />
          </View>
          {sent.where === 'server' ? <Hand size={20} color={C.ok} rotate={0} style={{ marginTop: 14 }}>✓ Received by the NILNA team</Hand> : null}
          <P muted style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>{`WhatsApp didn't open? Send the copied details to ${BRAND.whatsappDisplay}.`}</P>
          <View style={{ marginTop: 16, flexDirection: 'row', gap: 18 }}>
            <LinkText title="Change something" onPress={() => { setSent(null); setStep(4); }} />
            <LinkText title="Plan another event" onPress={() => { ctx.reset(); setSent(null); setStep(1); }} />
          </View>
        </View>
      </Screen>
    );
  }

  /* ---------- quick call-back ---------- */
  if (quick) {
    return (
      <Screen>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.card, sticker(6)]}>
            <Hand size={24}>Quick call-back</Hand>
            <H size={30} style={{ marginTop: 4 }}>Leave your number,</H>
            <Hand size={36} style={{ marginTop: -2 }}>{"we'll do the rest"}</Hand>
            <P muted style={{ marginTop: 6 }}>A planner calls or WhatsApps you to understand the occasion. No forms.</P>
            <Field label="Your name" value={plan.name} onChange={v => update({ name: v })} autoComplete="name" />
            <Field label="WhatsApp number" value={plan.phone} onChange={v => update({ phone: v })} keyboard="phone-pad" placeholder="050 123 4567" autoComplete="tel" />
            <Label style={{ marginTop: 16 }}>Occasion</Label>
            <ChipRow options={OCCASIONS.map(o => o.name)} value={plan.occasion} onChange={setOccasion} />
            {err ? <Text style={styles.err}>{err}</Text> : null}
            <View style={styles.nav}>
              <Btn small title="← Full booking" onPress={() => { setErr(''); setQuick(false); }} />
              <Btn kind="accent" title="Request call-back →" onPress={() => finish(true)} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  const header = (
    <View style={styles.steps}>
      {STEPS.map((t, i) => {
        const n = i + 1, cur = n === step, done = n < step;
        return (
          <Pressable key={t} disabled={n >= step} onPress={() => setStep(n)} style={{ flex: 1, gap: 6 }} accessibilityRole="button" accessibilityLabel={`Step ${n}: ${t}`} accessibilityState={{ selected: cur, disabled: n > step }}>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: cur ? C.brand : done ? C.ink : C.line }} />
            <Text style={{ fontFamily: F.heavy, fontSize: 11, color: cur ? C.brand : done ? C.ink : C.muted }}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
  const nav = (onNext: () => void, nextLabel = 'Continue') => (
    <View style={styles.nav}>
      {step > 1 ? <Btn small title="← Back" onPress={() => setStep(step - 1)} /> : <View />}
      <Btn kind="accent" title={`${nextLabel} →`} onPress={onNext} />
    </View>
  );

  return (
    <Screen>
      <Hand size={24}>Your plan</Hand>
      <H size={34} style={{ marginTop: 4 }}>Book your</H>
      <Hand size={42} style={{ marginTop: -2, marginBottom: 6 }}>event</Hand>
      <P muted style={{ marginBottom: 18 }}>Four quick questions. It takes about a minute.</P>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.card, sticker(6)]}>
          {header}

          {step === 1 && (
            <>
              <H size={26}>What are we celebrating?</H>
              <View style={[styles.tiles, { marginTop: 16 }]}>
                {OCCASIONS.map(o => {
                  const on = o.name === plan.occasion;
                  return (
                    <Pressable key={o.name} onPress={() => { setOccasion(o.name); setStep(2); }} accessibilityRole="button" accessibilityState={{ selected: on }}
                      style={({ pressed }) => [styles.tile, on && { borderColor: C.brand, backgroundColor: C.brandSoft }, pressed && { transform: [{ translateY: 1 }] }]}>
                      <View style={[styles.tileIc, on && { backgroundColor: C.brand }]}><Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={18} color={on ? '#fff' : C.brand} /></View>
                      <Text style={{ fontFamily: F.heavy, fontSize: 14, color: C.ink }}>{o.name}</Text>
                      <Text style={{ fontFamily: F.regular, fontSize: 11.5, color: C.muted }}>{o.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
                <P muted>In a hurry?</P><LinkText title="Just call me back" onPress={() => setQuick(true)} />
              </View>
              {nav(() => setStep(2))}
            </>
          )}

          {step === 2 && (
            <>
              <H size={26}>When, where & how many?</H>
              <Label style={{ marginTop: 18 }}>Date</Label>
              <View style={styles.row}>
                {quickDates.map(([l, d]) => <QChip key={l} label={l} on={plan.date === d} onPress={() => update({ date: d })} />)}
                {Platform.OS === 'web' ? (
                  <TextInput value={plan.date} onChangeText={v => update({ date: v })} placeholder="YYYY-MM-DD" style={[styles.input, { flexGrow: 1, minWidth: 140, marginTop: 0 }]} accessibilityLabel="Event date" />
                ) : (
                  <QChip label={plan.date && !quickDates.some(q => q[1] === plan.date) ? plan.date : 'Pick a date…'} on={!!plan.date && !quickDates.some(q => q[1] === plan.date)} onPress={() => setShowPicker(true)} />
                )}
              </View>
              {showPicker && Platform.OS !== 'web' ? (
                <DateTimePicker value={plan.date ? new Date(plan.date) : new Date()} mode="date" minimumDate={new Date()} display={Platform.OS === 'ios' ? 'inline' : 'default'} accentColor={C.brand}
                  onValueChange={(_, d) => { update({ date: iso(d) }); if (Platform.OS !== 'ios') setShowPicker(false); }} onDismiss={() => setShowPicker(false)} />
              ) : null}
              {showPicker && Platform.OS === 'ios' ? <Btn small title="Done" onPress={() => setShowPicker(false)} style={{ alignSelf: 'flex-end' }} /> : null}
              <View style={styles.switchRow}>
                <Switch value={plan.flexibleDate} onValueChange={v => update({ flexibleDate: v })} trackColor={{ true: C.brand, false: C.line }} accessibilityLabel="My date is flexible" />
                <P>My date is flexible</P>
              </View>
              <Label style={{ marginTop: 18 }}>Guests</Label>
              <ChipRow options={GUESTS} value={plan.guests} onChange={v => update({ guests: v })} />
              <Label style={{ marginTop: 18 }}>Emirate</Label>
              <ChipRow options={EMIRATES} value={plan.emirate} onChange={v => update({ emirate: v })} />
              <Label style={{ marginTop: 18 }}>Venue</Label>
              <ChipRow options={VENUES.includes(plan.venue) ? VENUES : [plan.venue, ...VENUES]} value={plan.venue} onChange={v => update({ venue: v })} />
              {plan.group === 'corporate' ? (<><Label style={{ marginTop: 18 }}>Seating</Label><ChipRow options={SEATING} value={plan.seating} onChange={v => update({ seating: v })} /></>) : null}
              {nav(() => setStep(3))}
            </>
          )}

          {step === 3 && (
            <>
              <H size={26}>Choose a package</H>
              <P muted style={{ marginTop: 4 }}>Every package is tailored after we talk. Not sure? Let us advise.</P>
              <View style={{ gap: 10, marginTop: 14 }}>
                {PACKAGES[plan.group].list.map((p, i) => {
                  const on = plan.packageIndex === i;
                  return (
                    <Pressable key={p.name} onPress={() => choosePackage(plan.group, i)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                      style={[styles.pk, on && { borderColor: C.brand, backgroundColor: C.brandSoft }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: F.black, fontSize: 16, color: C.ink }}>{p.name}</Text>
                        {p.featured ? <Hand size={17} rotate={0}>Most booked</Hand> : null}
                      </View>
                      <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.muted }}>{p.for}</Text>
                      <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: C.ink2, marginTop: 4 }}>{p.includes.slice(0, 3).join(' · ')}</Text>
                    </Pressable>
                  );
                })}
                <Pressable onPress={() => choosePackage(plan.group, null)} accessibilityRole="radio" accessibilityState={{ checked: plan.packageIndex === null }}
                  style={[styles.pk, { borderStyle: 'dashed' }, plan.packageIndex === null && { borderColor: C.brand, backgroundColor: C.brandSoft }]}>
                  <Text style={{ fontFamily: F.black, fontSize: 16, color: C.ink }}>Advise me</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 13, color: C.muted }}>A planner suggests the best fit · free consultation</Text>
                </Pressable>
              </View>
              <Label style={{ marginTop: 20 }}>Budget (optional, {currency})</Label>
              <View style={styles.row}>{BUDGETS[currency].map((b, i) => <QChip key={b} label={b} on={plan.budgetIndex === i} onPress={() => update({ budgetIndex: i })} />)}</View>
              <Pressable onPress={() => setShowMore(!showMore)} style={styles.more} accessibilityRole="button" accessibilityState={{ expanded: showMore }}>
                <Text style={{ fontFamily: F.heavy, fontSize: 14, color: C.ink2 }}>{showMore ? '▾' : '▸'} Add a note or extra services (optional)</Text>
              </Pressable>
              {showMore ? (
                <>
                  <TextInput value={plan.idea} onChangeText={v => update({ idea: v })} placeholder="Colours, theme, surprise details, must-haves…" placeholderTextColor={C.muted} multiline style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]} accessibilityLabel="Your idea" />
                  <View style={[styles.row, { marginTop: 10 }]}>
                    <Btn small title={`Browse ${SERVICE_COUNT} services`} onPress={() => router.navigate('/services')} />
                    <Btn small title="Ideas from Nina" onPress={() => router.push({ pathname: '/nina', params: { q: `Suggest ideas and services for my ${plan.occasion} (${plan.guests} guests, ${plan.emirate})` } })} />
                  </View>
                  {plan.services.length ? <P muted style={{ marginTop: 8, fontSize: 13 }}>{plan.services.length} extra services added.</P> : null}
                </>
              ) : null}
              {nav(() => setStep(4))}
            </>
          )}

          {step === 4 && (
            <>
              <H size={26}>Where should we reply?</H>
              <P muted style={{ marginTop: 4 }}>{"We'll send your quote on WhatsApp. No spam, ever."}</P>
              <Field label="Your name" value={plan.name} onChange={v => update({ name: v })} placeholder="e.g. Aisha" autoComplete="name" />
              <Field label="WhatsApp number" value={plan.phone} onChange={v => update({ phone: v })} keyboard="phone-pad" placeholder="050 123 4567" autoComplete="tel" />
              <Field label="Email (optional)" value={plan.email} onChange={v => update({ email: v })} keyboard="email-address" autoComplete="email" />
              <Field label="Company (optional)" value={plan.company} onChange={v => update({ company: v })} />
              {err ? <Text style={styles.err}>{err}</Text> : null}
              {nav(() => finish(false), 'Get my free quote')}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* plan summary note */}
      <Sticky tilt={1.2} style={{ marginTop: 34 }}>
        <Hand size={22} color={C.ink} rotate={0}>Your {plan.occasion}</Hand>
        {[['Date', plan.date ? `${plan.date}${plan.flexibleDate ? ' (flexible)' : ''}` : 'TBC'], ['Guests', plan.guests], ['Emirate', plan.emirate], ['Venue', plan.venue], ['Package', ctx.packageName ?? 'Advise me'], ['Budget', budgetLabel], ['Language', lang], ['Extras', plan.services.length ? `${plan.services.length} services` : 'None']].map(([k, v]) => (
          <View key={k} style={styles.sumRow}><Text style={styles.sumK}>{k}</Text><Text style={styles.sumV}>{v}</Text></View>
        ))}
      </Sticky>
    </Screen>
  );
}

function QChip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.qchip, on && { backgroundColor: C.ink, borderColor: C.ink }]}>
      <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: on ? '#fff' : C.ink }}>{label}</Text>
    </Pressable>
  );
}

function Field({ label, value, onChange, placeholder, keyboard, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboard?: 'phone-pad' | 'email-address'; autoComplete?: 'name' | 'tel' | 'email';
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Label style={{ marginBottom: 0 }}>{label}</Label>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} keyboardType={keyboard} autoComplete={autoComplete}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'} style={styles.input} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 20 },
  steps: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 12, gap: 4, backgroundColor: C.card },
  tileIc: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  qchip: { borderWidth: 1.5, borderColor: C.line, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: C.card },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  pk: { borderWidth: 1.5, borderColor: C.line, borderRadius: 14, padding: 14, gap: 2, backgroundColor: C.card },
  more: { marginTop: 18, paddingTop: 12, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  input: { marginTop: 6, borderWidth: 1.5, borderColor: C.line, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontFamily: F.semi, fontSize: 16, color: C.ink, backgroundColor: C.card },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 24, flexWrap: 'wrap' },
  err: { color: C.bad, fontFamily: F.bold, fontSize: 14, marginTop: 12 },
  tick: { width: 68, height: 68, borderRadius: 34, backgroundColor: C.wa, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(21,19,17,0.15)' },
  sumK: { fontFamily: F.bold, fontSize: 13.5, color: C.muted },
  sumV: { fontFamily: F.heavy, fontSize: 13.5, color: C.ink, flexShrink: 1, textAlign: 'right' },
});
