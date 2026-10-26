import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Chip, ChipRow, DotPaper, Hand, H, Label, P, useToast } from '@/components/ui';
import { API_URL, STAFF_PIN } from '@/config';
import { GROUP_ORDER, OCCASIONS, PACKAGES } from '@/data/catalog';
import { Booking, deleteBooking, listBookings, newRef, parseWhatsApp, saveBooking, SOURCES, STATUSES, Status, toCsv } from '@/lib/bookings';
import { BUDGETS, EMIRATES, GUESTS, LANGS, VENUES } from '@/lib/locale';
import { openWhatsApp, toWaNumber } from '@/lib/whatsapp';
import { usePlan } from '@/store/plan';
import { C, F, STATUS_COLORS, sticker } from '@/theme';

const fmt = (s: string) => { const d = new Date(s); return isNaN(+d) ? (s || '—') : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
const fmtWhen = (s: string) => { const d = new Date(s); return isNaN(+d) ? '—' : `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`; };

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [rows, setRows] = useState<Booking[]>([]);
  const [mode, setMode] = useState<'server' | 'device'>('device');
  const [loadErr, setLoadErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState<'bookings' | 'customers'>('bookings');
  const [status, setStatus] = useState<'All' | Status>('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Booking | null>(null);
  const [sheet, setSheet] = useState<null | 'add' | 'import'>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const r = await listBookings();
    setRows([...r.rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setMode(r.source); setLoadErr(r.error ?? ''); setLoading(false); setNow(Date.now());
  }, []);
  useFocusEffect(useCallback(() => { if (unlocked) load(); }, [unlocked, load]));

  const kpi = useMemo(() => {
    const wk = new Date(now - 7 * 864e5).toISOString(), today = new Date(now).toISOString().slice(0, 10), in30 = new Date(now + 30 * 864e5).toISOString().slice(0, 10);
    return {
      total: rows.length, week: rows.filter(r => r.createdAt >= wk).length,
      open: rows.filter(r => ['New', 'Contacted', 'Quoted'].includes(r.status)).length,
      confirmed: rows.filter(r => r.status === 'Confirmed').length,
      upcoming: rows.filter(r => r.status !== 'Cancelled' && r.date >= today && r.date <= in30).length,
    };
  }, [rows, now]);
  const byOcc = useMemo(() => { const m: Record<string, number> = {}; rows.forEach(r => { m[r.occasion || '—'] = (m[r.occasion || '—'] ?? 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6); }, [rows]);
  const filtered = useMemo(() => { const s = q.toLowerCase(); return rows.filter(r => (status === 'All' || r.status === status) && (!s || [r.ref, r.name, r.phone, r.email, r.company, r.occasion, r.emirate, r.pkg].join(' ').toLowerCase().includes(s))); }, [rows, q, status]);
  const customers = useMemo(() => {
    const m = new Map<string, { name: string; phone: string; email: string; language: string; count: number; confirmed: number; occasions: Set<string>; next: string; last: string }>();
    rows.forEach(r => {
      const k = r.phone.replace(/\D/g, '') || r.email || r.name || r.id;
      const c = m.get(k) ?? { name: r.name, phone: r.phone, email: r.email, language: String(r.language || ''), count: 0, confirmed: 0, occasions: new Set<string>(), next: '', last: '' };
      c.count++; if (['Confirmed', 'Completed'].includes(r.status)) c.confirmed++; c.occasions.add(r.occasion);
      if (!c.last || r.createdAt > c.last) c.last = r.createdAt;
      if (r.date && r.status !== 'Cancelled' && (!c.next || r.date < c.next)) c.next = r.date;
      m.set(k, c);
    });
    return [...m.values()].filter(c => !q || [c.name, c.phone, c.email].join(' ').toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.last.localeCompare(a.last));
  }, [rows, q]);

  const persist = async (b: Booking, msg: string) => {
    try { await saveBooking(b, mode); toast(msg); await load(); setOpen(o => (o && o.id === b.id ? { ...b } : o)); }
    catch { toast("Couldn't save. Check the connection and try again."); }
  };

  if (!unlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper, padding: 24, justifyContent: 'center' }}>
        <DotPaper />
        <View style={[styles.card, sticker(5)]}>
          <Hand size={24}>Staff only</Hand>
          <H size={28} style={{ marginTop: 4 }}>Enter the staff PIN</H>
          <P muted style={{ marginTop: 6 }}>The dashboard shows every booking and customer. Ask the NILNA manager for the PIN.</P>
          <TextInput value={pin} onChangeText={t => { setPin(t); setPinErr(''); }} secureTextEntry keyboardType="number-pad" maxLength={8} placeholder="PIN" placeholderTextColor={C.muted}
            style={[styles.input, { marginTop: 16, fontSize: 22, letterSpacing: 6, textAlign: 'center' }]} accessibilityLabel="Staff PIN" onSubmitEditing={() => (pin === STAFF_PIN ? setUnlocked(true) : setPinErr('That PIN is not right. Try again.'))} />
          {pinErr ? <Text style={styles.err}>{pinErr}</Text> : null}
          <Btn kind="dark" title="Unlock dashboard" style={{ marginTop: 16 }} onPress={() => (pin === STAFF_PIN ? setUnlocked(true) : setPinErr('That PIN is not right. Try again.'))} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <DotPaper />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={C.brand} />}>
        <Hand size={22}>Bookings & customers</Hand>
        <H size={32} style={{ marginTop: 4 }}>Booking dashboard</H>
        <P muted style={{ marginTop: 4, fontSize: 13 }}>{mode === 'server' ? 'Live from the NILNA server.' : API_URL ? 'Offline: showing bookings saved on this device.' : 'No server set up: showing bookings saved on this device.'}</P>
        {loadErr ? <Text style={styles.err}>{loadErr}</Text> : null}
        <View style={[styles.row, { marginTop: 14 }]}>
          <Btn small kind="dark" icon="add" title="Add booking" onPress={() => setSheet('add')} />
          <Btn small icon="logo-whatsapp" title="Import WhatsApp" onPress={() => setSheet('import')} />
          <Btn small icon="share-outline" title="Export CSV" onPress={() => Share.share({ title: 'NILNA Events bookings', message: toCsv(filtered) }).catch(() => {})} />
        </View>

        <View style={[styles.kpis, { marginTop: 20 }]}>
          {[['Total', kpi.total, 'all time'], ['New this week', kpi.week, 'last 7 days'], ['Open pipeline', kpi.open, 'new · contacted · quoted'], ['Confirmed', kpi.confirmed, 'awaiting the event'], ['Next 30 days', kpi.upcoming, 'events coming up']].map(([l, n, s]) => (
            <View key={String(l)} style={[styles.kpi, sticker(3)]}>
              <Text style={styles.kpiL}>{l}</Text><Text style={styles.kpiN}>{n}</Text><Text style={styles.kpiS}>{s}</Text>
            </View>
          ))}
        </View>

        {byOcc.length ? (
          <View style={[styles.card, { marginTop: 18 }]}>
            <Label>Bookings by occasion</Label>
            {byOcc.map(([k, v]) => (
              <View key={k} style={styles.bar}>
                <Text numberOfLines={1} style={{ width: 120, fontFamily: F.semi, fontSize: 13, color: C.ink }}>{k}</Text>
                <View style={{ flex: 1, height: 10, backgroundColor: C.cream, borderRadius: 5 }}><View style={{ width: `${(v / byOcc[0][1]) * 100}%`, height: 10, borderRadius: 5, backgroundColor: C.brand }} /></View>
                <Text style={{ width: 28, textAlign: 'right', fontFamily: F.heavy, fontSize: 13 }}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.row, { marginTop: 24 }]}>
          <Chip label={`Bookings (${rows.length})`} on={tab === 'bookings'} onPress={() => setTab('bookings')} />
          <Chip label={`Customers (${customers.length})`} on={tab === 'customers'} onPress={() => setTab('customers')} />
        </View>
        <TextInput value={q} onChangeText={setQ} placeholder="Search name, phone, reference…" placeholderTextColor={C.muted} style={[styles.input, { marginTop: 12 }]} accessibilityLabel="Search bookings" />
        {tab === 'bookings' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
            {(['All', ...STATUSES] as const).map(s => <Chip key={s} label={s} on={status === s} onPress={() => setStatus(s)} />)}
          </ScrollView>
        ) : null}

        {rows.length === 0 ? (
          <View style={[styles.card, { marginTop: 18, alignItems: 'center' }]}>
            <H size={22}>No bookings yet</H>
            <P muted style={{ textAlign: 'center', marginTop: 6 }}>Bookings appear here when customers book in the app, staff add one by hand, or you import a WhatsApp booking message.</P>
          </View>
        ) : tab === 'bookings' ? (
          <View style={{ gap: 10, marginTop: 14 }}>
            {filtered.length === 0 ? <P muted>No bookings match these filters.</P> : filtered.map(r => (
              <Pressable key={r.id} onPress={() => setOpen(r)} style={({ pressed }) => [styles.rowCard, pressed && { backgroundColor: C.note }]} accessibilityRole="button" accessibilityLabel={`Booking ${r.ref} for ${r.name}`}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: F.heavy, fontSize: 15, color: C.ink }}>{r.name || '—'}</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.ink2 }}>{r.occasion} · {fmt(r.date)} · {r.emirate}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: C.muted }}>{r.ref} · {r.source} · {fmtWhen(r.createdAt)}</Text>
                </View>
                <View style={[styles.pill, { borderColor: STATUS_COLORS[r.status] }]}><Text style={{ fontFamily: F.heavy, fontSize: 11, color: STATUS_COLORS[r.status] }}>{r.status}</Text></View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 14 }}>
            {customers.map(c => (
              <Pressable key={c.phone + c.name} onPress={() => { setTab('bookings'); setStatus('All'); setQ(c.phone || c.name); }} style={styles.rowCard} accessibilityRole="button">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: F.heavy, fontSize: 15, color: C.ink }}>{c.name || '—'}</Text>
                  <Text style={{ fontFamily: F.semi, fontSize: 13, color: C.ink2 }}>{c.phone || c.email || '—'}{c.language ? ` · ${c.language}` : ''}</Text>
                  <Text style={{ fontFamily: F.regular, fontSize: 12, color: C.muted }}>{[...c.occasions].join(', ')} · next {fmt(c.next)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}><Text style={{ fontFamily: F.black, fontSize: 22, color: C.ink }}>{c.count}</Text><Text style={{ fontFamily: F.semi, fontSize: 11, color: C.muted }}>{c.confirmed} confirmed</Text></View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BookingDetail key={open?.id ?? 'none'} booking={open} onClose={() => setOpen(null)} onSave={persist}
        onDelete={async b => { try { await deleteBooking(b.id, mode); setOpen(null); toast('Booking deleted'); load(); } catch { toast("Couldn't delete. Try again."); } }} />
      <AddSheet visible={sheet === 'add'} onClose={() => setSheet(null)} onSave={async b => { await persist(b, 'Booking saved'); setSheet(null); }} />
      <ImportSheet visible={sheet === 'import'} onClose={() => setSheet(null)} onSave={async b => { await persist(b, 'Booking imported'); setSheet(null); }} />
    </View>
  );
}

function SheetFrame({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <View style={styles.sheetHead}>
          <Text style={{ fontFamily: F.black, fontSize: 20, color: C.ink, flex: 1 }} numberOfLines={1}>{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}><Ionicons name="close" size={26} color={C.ink} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}

function BookingDetail({ booking, onClose, onSave, onDelete }: { booking: Booking | null; onClose: () => void; onSave: (b: Booking, msg: string) => void; onDelete: (b: Booking) => void }) {
  const [notes, setNotes] = useState(booking?.notes ?? '');
  const [confirm, setConfirm] = useState(false);
  const b = booking;
  if (!b) return null;
  const rowsKV: [string, string][] = [['Reference', b.ref], ['Phone', b.phone], ['Email', b.email], ['Company', b.company], ['Language', String(b.language)], ['Occasion', b.occasion], ['Event date', fmt(b.date)], ['Guests', b.guests], ['Emirate', b.emirate], ['Venue', b.venue], ['Seating', b.seating], ['Package', [b.pkgGroup, b.pkg].filter(Boolean).join(' · ')], ['Services', b.services.join(', ')], ['Budget', b.budget], ['Currency', String(b.currency)], ['Idea', b.idea], ['Source', b.source], ['Received', fmtWhen(b.createdAt)]];
  return (
    <SheetFrame visible={!!b} title={b.name || 'Booking'} onClose={onClose}>
      <Label>Status</Label>
      <ChipRow options={[...STATUSES]} value={b.status} onChange={v => onSave({ ...b, status: v as Status }, `Status set to ${v}`)} />
      {b.phone ? <Btn small kind="wa" icon="logo-whatsapp" title={`WhatsApp ${b.name.split(' ')[0] || 'customer'}`} style={{ alignSelf: 'flex-start', marginTop: 14 }}
        onPress={() => openWhatsApp(`Hello ${b.name}, this is NILNA Events about your ${b.occasion} booking (${b.ref}).`, toWaNumber(b.phone))} /> : null}
      <View style={{ marginTop: 18 }}>
        {rowsKV.map(([k, v]) => (
          <View key={k} style={styles.kv}><Text style={styles.kvK}>{k}</Text><Text style={styles.kvV} selectable>{v || '—'}</Text></View>
        ))}
      </View>
      <Label style={{ marginTop: 18 }}>Internal notes</Label>
      <TextInput value={notes} onChangeText={setNotes} multiline placeholder="Calls, quotes sent, supplier notes…" placeholderTextColor={C.muted} style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} accessibilityLabel="Internal notes" />
      <View style={[styles.row, { justifyContent: 'space-between', marginTop: 16 }]}>
        {confirm ? (
          <View style={[styles.row, { alignItems: 'center' }]}>
            <Text style={{ fontFamily: F.bold, color: C.bad }}>Delete for good?</Text>
            <Btn small title="Keep" onPress={() => setConfirm(false)} />
            <Btn small kind="accent" title="Delete" onPress={() => onDelete(b)} />
          </View>
        ) : <Btn small title="Delete" onPress={() => setConfirm(true)} />}
        <Btn small kind="dark" title="Save notes" onPress={() => onSave({ ...b, notes }, 'Notes saved')} />
      </View>
    </SheetFrame>
  );
}

function AddSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (b: Booking) => void }) {
  const { currency } = usePlan();
  const blank = () => ({ name: '', phone: '', email: '', company: '', occasion: 'Birthday', date: '', guests: '30 – 100', emirate: 'Dubai', venue: 'Not decided', pkg: '', budget: BUDGETS[currency][0], language: 'English', source: 'Phone', status: 'New' as Status, idea: '' });
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const set = (p: Partial<ReturnType<typeof blank>>) => setF(x => ({ ...x, ...p }));
  const pkgs = GROUP_ORDER.flatMap(g => PACKAGES[g].list.map(p => `${PACKAGES[g].label}|${p.name}`));
  const save = () => {
    if (f.name.trim().length < 2) return setErr("Enter the customer's name.");
    if (!f.phone.trim() && !f.email.trim()) return setErr('Enter a mobile number or an email so the team can reach them.');
    const [grp, pk] = f.pkg ? f.pkg.split('|') : ['', ''];
    onSave({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ref: newRef(), createdAt: new Date().toISOString(), source: f.source, status: f.status,
      name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), company: f.company.trim(), occasion: f.occasion, date: f.date, guests: f.guests, emirate: f.emirate,
      venue: f.venue, seating: '', pkgGroup: grp, pkg: pk, services: [], budget: f.budget, currency, language: f.language, idea: f.idea.trim(), notes: '' });
    setF(blank()); setErr('');
  };
  const input = (label: string, key: 'name' | 'phone' | 'email' | 'company' | 'date' | 'idea', extra?: object) => (
    <View style={{ marginTop: 12 }}><Label style={{ marginBottom: 4 }}>{label}</Label><TextInput value={f[key]} onChangeText={v => set({ [key]: v })} style={styles.input} placeholderTextColor={C.muted} accessibilityLabel={label} {...extra} /></View>
  );
  return (
    <SheetFrame visible={visible} title="Add booking" onClose={onClose}>
      {input('Customer name', 'name')}
      {input('Mobile', 'phone', { keyboardType: 'phone-pad', placeholder: '050 123 4567' })}
      {input('Email', 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
      {input('Company', 'company')}
      {input('Event date (YYYY-MM-DD)', 'date', { placeholder: '2026-12-02' })}
      <Label style={{ marginTop: 16 }}>Occasion</Label><ChipRow options={OCCASIONS.map(o => o.name)} value={f.occasion} onChange={v => set({ occasion: v })} />
      <Label style={{ marginTop: 16 }}>Guests</Label><ChipRow options={GUESTS} value={f.guests} onChange={v => set({ guests: v })} />
      <Label style={{ marginTop: 16 }}>Emirate</Label><ChipRow options={EMIRATES} value={f.emirate} onChange={v => set({ emirate: v })} />
      <Label style={{ marginTop: 16 }}>Venue</Label><ChipRow options={VENUES} value={f.venue} onChange={v => set({ venue: v })} />
      <Label style={{ marginTop: 16 }}>Package</Label>
      <ChipRow options={['', ...pkgs]} value={f.pkg} onChange={v => set({ pkg: v })} labels={Object.fromEntries([['', 'Not sure yet'], ...pkgs.map(p => [p, p.split('|')[1]])])} />
      <Label style={{ marginTop: 16 }}>Budget</Label><ChipRow options={BUDGETS[currency]} value={f.budget} onChange={v => set({ budget: v })} />
      <Label style={{ marginTop: 16 }}>Language</Label><ChipRow options={LANGS.map(l => l.key)} value={f.language} onChange={v => set({ language: v })} />
      <Label style={{ marginTop: 16 }}>Source</Label><ChipRow options={[...SOURCES]} value={f.source} onChange={v => set({ source: v })} />
      <Label style={{ marginTop: 16 }}>Status</Label><ChipRow options={[...STATUSES]} value={f.status} onChange={v => set({ status: v as Status })} />
      {input('Idea / notes', 'idea', { multiline: true, style: [styles.input, { minHeight: 80, textAlignVertical: 'top' }] })}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Btn kind="dark" title="Save booking" style={{ marginTop: 18 }} onPress={save} />
    </SheetFrame>
  );
}

function ImportSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (b: Booking) => void }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const preview = useMemo(() => parseWhatsApp(text), [text]);
  return (
    <SheetFrame visible={visible} title="Import WhatsApp message" onClose={onClose}>
      <P muted>Paste the booking message a customer sent from the app or website. The fields are read automatically.</P>
      <TextInput value={text} onChangeText={t => { setText(t); setErr(''); }} multiline placeholder={"Hi NILNA Events, I'd like to plan an event.\nOccasion: …"} placeholderTextColor={C.muted}
        style={[styles.input, { minHeight: 200, marginTop: 12, textAlignVertical: 'top' }]} accessibilityLabel="WhatsApp message" />
      {preview ? (
        <View style={{ marginTop: 14 }}>
          {[['Customer', preview.name], ['Mobile', preview.phone], ['Occasion', preview.occasion], ['Date', preview.date], ['Package', preview.pkg], ['Services', `${preview.services.length} listed`]].map(([k, v]) => (
            <View key={k} style={styles.kv}><Text style={styles.kvK}>{k}</Text><Text style={styles.kvV}>{v || '—'}</Text></View>
          ))}
        </View>
      ) : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Btn kind="dark" title="Create booking" style={{ marginTop: 18 }} onPress={() => {
        if (!preview) return setErr('This doesn\'t look like a NILNA booking message. It should contain lines like "Occasion:" and "Name:".');
        onSave(preview); setText('');
      }} />
    </SheetFrame>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { borderWidth: 1.5, borderColor: C.line, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontFamily: F.semi, fontSize: 15, color: C.ink, backgroundColor: C.card },
  err: { color: C.bad, fontFamily: F.bold, fontSize: 14, marginTop: 10 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: { width: '47%', flexGrow: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 14 },
  kpiL: { fontFamily: F.heavy, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  kpiN: { fontFamily: F.black, fontSize: 34, color: C.ink },
  kpiS: { fontFamily: F.regular, fontSize: 12, color: C.muted },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 14 },
  pill: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderBottomWidth: 1.5, borderColor: C.ink, backgroundColor: C.note },
  kv: { flexDirection: 'row', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: C.line },
  kvK: { width: 100, fontFamily: F.bold, fontSize: 13, color: C.muted },
  kvV: { flex: 1, fontFamily: F.semi, fontSize: 14, color: C.ink },
});
