import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/chrome';
import { PackageCard } from '@/components/PackageCard';
import { Btn, Hand, H, LinkText, P, Pin, Polaroid, Section, Sticky } from '@/components/ui';
import { BRAND, WEDDING_OFFER } from '@/config';
import { CATEGORIES, OCCASIONS, PACKAGE_COUNT, SERVICE_COUNT } from '@/data/catalog';
import { usePlan } from '@/store/plan';
import { C, F, sticker } from '@/theme';

const TILTS = [-1.4, 1, -0.6, 1.5];
const WHY: [string, string][] = [
  ['One planner', 'A dedicated contact from first call to final invoice.'],
  ['Every scale', 'Home surprises to 1,000+ guest productions.'],
  ['Permits handled', 'Venue, hospital and mall approvals done for you.'],
  ['Five languages', 'Arabic, English, Hindi, Urdu and French.'],
  ['Cultural fluency', 'Henna nights, nikah, majlis and Emirati heritage.'],
  ['AI + human', 'Nina answers instantly; a planner confirms every detail.'],
];
const NOTE_COLORS = [C.note, C.note2, C.note3];

export default function Home() {
  const { setOccasion, choosePackage } = usePlan();
  const startWith = (name: string) => { setOccasion(name); router.navigate('/book'); };

  return (
    <Screen>
      {/* hero */}
      <Hand size={26}>Event planning, made easy ✦</Hand>
      <H size={46} style={{ marginTop: 8 }}>Your event,</H>
      <Hand size={60} style={{ marginTop: -4, marginBottom: 10 }}>sorted.</Hand>
      <P>Birthdays, proposals, baby welcomes, weddings, openings, National Day and corporate events across the UAE. Pick what you need and one NILNA planner takes care of the rest.</P>
      <View style={[styles.row, { marginTop: 18 }]}>
        <Btn kind="accent" title="Book in 1 minute" onPress={() => router.navigate('/book')} />
        <Btn title="Ask Nina" onPress={() => router.push('/nina')} />
      </View>
      <View style={{ marginTop: 34, paddingHorizontal: 6 }}>
        <Polaroid kind="celebration" caption="Lina's 30th · Dubai Marina" tilt={2.5} />
        <Sticky style={{ position: 'absolute', right: -4, bottom: -22, width: 150 }} tilt={5}>
          <Hand size={20} color={C.ink} rotate={0}>Nina is online 24/7 in 5 languages ♡</Hand>
        </Sticky>
      </View>

      {/* season */}
      <View style={[styles.season, sticker(4)]}>
        <View style={styles.flag}><View style={{ width: 13, backgroundColor: '#EF3340' }} /><View style={{ flex: 1 }}><View style={{ flex: 1, backgroundColor: '#009739' }} /><View style={{ flex: 1, backgroundColor: '#fff' }} /><View style={{ flex: 1, backgroundColor: '#000' }} /></View></View>
        <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink, flex: 1 }}>UAE season: <Text style={{ color: C.brand }}>Flag Day, 3 Nov</Text> · <Text style={{ color: C.brand }}>National Day, 2 Dec</Text></Text>
      </View>
      <View style={[styles.row, { marginTop: 10 }]}>
        <Btn small title="Flag Day" onPress={() => { choosePackage('flagday', null); router.navigate('/packages'); }} />
        <Btn small kind="dark" title="National Day" onPress={() => { choosePackage('nationalday', null); router.navigate('/packages'); }} />
      </View>

      {/* occasions */}
      <Section kicker="Occasions" title="What are we" accent="celebrating?" />
      <View style={styles.grid}>
        {OCCASIONS.filter(o => o.name !== 'Other').map((o, i) => (
          <Pressable key={o.name} onPress={() => startWith(o.name)} accessibilityRole="button" accessibilityLabel={`Book ${o.name}`}
            style={({ pressed }) => [styles.occ, sticker(3), { transform: [{ rotate: `${pressed ? 0 : TILTS[i % 4]}deg` }] }]}>
            <View style={styles.occIc}><Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={20} color={C.brand} /></View>
            <Text style={{ fontFamily: F.heavy, fontSize: 14.5, color: C.ink }}>{o.name}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12, color: C.muted }}>{o.desc}</Text>
          </Pressable>
        ))}
      </View>

      {/* figures */}
      <View style={[styles.row, { marginTop: 30 }]}>
        {[[SERVICE_COUNT, 'services'], [PACKAGE_COUNT, 'packages'], [7, 'emirates'], [5, 'languages']].map(([n, l], i) => (
          <View key={String(l)} style={[styles.fig, sticker(3), { transform: [{ rotate: `${i % 2 ? 1.2 : -1.5}deg` }] }]}>
            <Text style={{ fontFamily: F.black, fontSize: 26, color: C.ink }}>{n}</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 11.5, color: C.muted }}>{l}</Text>
          </View>
        ))}
      </View>

      {/* most booked */}
      <Section kicker="Curated" title="Most booked" accent="this season" />
      <View style={{ gap: 30 }}>
        <PackageCard group="wedding" index={1} showGroup tilt={-1} />
        <PackageCard group="proposal" index={1} showGroup tilt={1} />
        <PackageCard group="birthday" index={0} showGroup tilt={-0.6} />
      </View>
      <View style={{ marginTop: 18 }}><LinkText title="See all packages" onPress={() => router.navigate('/packages')} /></View>

      {/* offer */}
      <View style={[styles.offer, sticker(5)]}>
        <Hand size={22}>Wedding season 2026–27</Hand>
        <H size={28} style={{ marginTop: 6 }}>{WEDDING_OFFER.title}</H>
        <P style={{ marginTop: 8 }}>{WEDDING_OFFER.body}</P>
        <Btn kind="dark" title="Wedding packages" style={{ alignSelf: 'flex-start', marginTop: 14 }} onPress={() => { choosePackage('wedding', null); router.navigate('/packages'); }} />
      </View>

      {/* departments */}
      <Section kicker="Departments" title="Every service," accent="one team" />
      <View style={styles.grid}>
        {CATEGORIES.map((c, i) => (
          <Pin key={c.name} tilt={i % 2 ? 0.8 : -1} style={styles.cat} onPress={() => router.navigate({ pathname: '/services', params: { cat: c.name } })} bg={i === 0 ? C.note : C.card}>
            <Hand size={32} rotate={0}>{c.services.length}</Hand>
            <Text style={{ fontFamily: F.black, fontSize: 14, color: C.ink, marginTop: 2 }}>{c.name}</Text>
          </Pin>
        ))}
      </View>

      {/* journey */}
      <Section kicker="The journey" title="How we" accent="work" />
      <View style={{ gap: 14 }}>
        {[['Share the idea', 'Tell Nina, tap through the booking, or message a planner.'], ['Concept & quote', 'A theme concept and itemised quote in AED or USD within 24 hours.'], ['We orchestrate', 'Venue, suppliers, permits and production, all handled.'], ['You celebrate', 'Our crew sets up, runs the day and clears everything after.']].map(([t, d], i) => (
          <View key={t} style={[styles.step, sticker(3)]}>
            <Hand size={38} rotate={0}>{String(i + 1).padStart(2, '0')}</Hand>
            <View style={{ flex: 1 }}><Text style={{ fontFamily: F.black, fontSize: 17, color: C.ink }}>{t}</Text><P muted style={{ fontSize: 14 }}>{d}</P></View>
          </View>
        ))}
      </View>

      {/* why */}
      <Section kicker="Why NILNA" title="Details," accent="handled" />
      <View style={styles.grid}>
        {WHY.map(([t, d], i) => (
          <Sticky key={t} color={NOTE_COLORS[i % 3]} tilt={i % 2 ? 1.2 : -1.4} style={styles.why}>
            <Hand size={24} color={C.ink} rotate={0}>{t}</Hand>
            <P style={{ fontSize: 13.5, marginTop: 4 }}>{d}</P>
          </Sticky>
        ))}
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Hand size={30}>Your event, sorted.</Hand>
        <P muted style={{ marginTop: 6 }}>{BRAND.parent} · luxury event planning & decoration in {BRAND.city}.</P>
        <P muted>WhatsApp {BRAND.whatsappDisplay} · {BRAND.email}</P>
        <View style={{ marginTop: 14 }}><LinkText title="Staff dashboard" onPress={() => router.push('/dashboard')} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  season: { marginTop: 54, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.note3, borderWidth: 1.5, borderColor: C.ink, padding: 14 },
  flag: { width: 42, height: 26, flexDirection: 'row', borderWidth: 1, borderColor: C.ink },
  occ: { width: '46%', flexGrow: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 14, gap: 6 },
  occIc: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.brandSoft, borderWidth: 1.5, borderColor: C.brand, alignItems: 'center', justifyContent: 'center' },
  fig: { flexGrow: 1, minWidth: '22%', backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, paddingVertical: 10, paddingHorizontal: 12 },
  offer: { marginTop: 50, backgroundColor: C.note2, borderWidth: 1.5, borderColor: C.ink, padding: 22 },
  cat: { width: '46%', flexGrow: 1, minHeight: 110, padding: 16 },
  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 16 },
  why: { width: '46%', flexGrow: 1 },
  footer: { marginTop: 56, borderTopWidth: 1.5, borderColor: C.ink, paddingTop: 24 },
});
