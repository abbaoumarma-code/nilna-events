import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { Screen } from '@/components/chrome';
import { Btn, Chip, Hand, H, P, useToast } from '@/components/ui';
import { SETUP_STYLES, VENUE_TYPES } from '@/data/catalog';
import { usePlan } from '@/store/plan';
import { C, F, sticker } from '@/theme';

const STAGES = ['Empty space', 'Layout & seating', 'Décor & florals', 'Stage & lighting', 'Guests arrive'];
const SCENES = {
  Ballroom: { wall: '#F4EFE6', floor: '#E3DCCF' },
  Beach: { wall: '#FBE7D6', floor: '#F1E2C6' },
  'Villa garden': { wall: '#EEF1E6', floor: '#CFE0B8' },
  Office: { wall: '#FAFAF8', floor: '#F2F2EF' },
} as const;
type SceneKey = keyof typeof SCENES;

function TourScene({ venue, stage }: { venue: SceneKey; stage: number }) {
  const sc = SCENES[venue];
  const tables = [0, 1, 2].flatMap(r => [0, 1, 2, 3].map(i => ({ x: 70 + i * 90 + (r % 2 ? 30 : 0), y: 150 + r * 40, s: 0.75 + r * 0.15 })));
  const vis = (n: number) => (stage >= n ? 1 : 0);
  return (
    <Svg viewBox="0 0 400 280" width="100%" height={undefined} style={{ aspectRatio: 400 / 280 }}>
      <Rect width="400" height="280" fill={sc.wall} />
      <Rect y="110" width="400" height="170" fill={sc.floor} />
      {venue === 'Beach' ? <Rect y="95" width="400" height="30" fill="#9FC7C9" /> : null}
      {venue === 'Office' ? [20, 120, 220, 320].map(x => <Rect key={x} x={x} y="18" width="62" height="60" fill="#DFE6E8" stroke={C.ink} strokeWidth={1} />) : null}
      {venue === 'Villa garden' ? <Rect x="70" y="20" width="260" height="90" fill="#fff" stroke={C.ink} strokeWidth={1} /> : null}
      {venue === 'Ballroom' ? [80, 200, 320].map(x => <Ellipse key={x} cx={x} cy="30" rx="20" ry="7" fill="none" stroke={C.ink} strokeWidth={1.2} />) : null}
      <Line x1="0" y1="110" x2="400" y2="110" stroke={C.ink} strokeWidth={1} />
      <G opacity={vis(1)}>
        {tables.map((t, i) => (
          <G key={i}>
            <Ellipse cx={t.x} cy={t.y} rx={20 * t.s} ry={7 * t.s} fill="#fff" stroke={C.ink} strokeWidth={1} />
            {[0, 1, 2, 3, 4, 5].map(k => <Circle key={k} cx={t.x + Math.cos((k / 6) * 6.28) * 27 * t.s} cy={t.y + Math.sin((k / 6) * 6.28) * 11 * t.s} r={2.8 * t.s} fill={C.ink} />)}
          </G>
        ))}
      </G>
      <G opacity={vis(2)}>
        {tables.map((t, i) => <Circle key={i} cx={t.x} cy={t.y - 5 * t.s} r={5 * t.s} fill={C.brand} />)}
        <Path d="M150 110 Q200 45 250 110" fill="none" stroke={C.brand} strokeWidth={9} strokeLinecap="round" strokeDasharray="1 11" />
        {venue === 'Office' ? Array.from({ length: 10 }, (_, i) => (
          <G key={i}><Rect x={i * 40 + 6} y={86} width={5} height={12} fill="#EF3340" /><Rect x={i * 40 + 11} y={86} width={13} height={4} fill="#009739" /><Rect x={i * 40 + 11} y={90} width={13} height={4} fill="#fff" /><Rect x={i * 40 + 11} y={94} width={13} height={4} fill="#000" /></G>
        )) : null}
      </G>
      <G opacity={vis(3)}>
        <Rect x="140" y="92" width="120" height="20" fill={C.ink} />
        <Rect x="160" y="55" width="80" height="34" fill={C.brand} />
        <Polygon points="70,0 40,280 110,280" fill={C.brand} opacity={0.1} />
        <Polygon points="330,0 290,280 360,280" fill={C.brand} opacity={0.1} />
        {Array.from({ length: 14 }, (_, i) => <Circle key={i} cx={i * 30 + 10} cy={12 + Math.sin(i / 2) * 6} r={3.5} fill="#FFD9A8" />)}
      </G>
      <G opacity={vis(4)}>
        {[[40, 255], [90, 262], [150, 250], [220, 264], [280, 252], [340, 260], [120, 200], [300, 205]].map(([x, y], i) => (
          <G key={i}><Circle cx={x} cy={y - 10} r={4} fill={i % 3 ? C.ink : C.brand} /><Rect x={x - 4} y={y - 6} width={8} height={11} rx={4} fill={i % 3 ? C.ink : C.brand} /></G>
        ))}
      </G>
    </Svg>
  );
}

export default function Venues() {
  const [venue, setVenue] = useState<SceneKey>('Ballroom');
  const [stage, setStage] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [vt, setVt] = useState<number | null>(null);
  const [seat, setSeat] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { plan, update, setOccasion } = usePlan();
  const toast = useToast();

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const play = () => {
    if (playing) { if (timer.current) clearInterval(timer.current); setPlaying(false); return; }
    setStage(0); setPlaying(true);
    timer.current = setInterval(() => setStage(s => { if (s >= 4) { if (timer.current) clearInterval(timer.current); setPlaying(false); return 4; } return s + 1; }), 1000);
  };

  return (
    <Screen>
      <Hand size={24}>Visual tour</Hand>
      <H size={36} style={{ marginTop: 6 }}>Watch the room</H>
      <Hand size={44} style={{ marginTop: -4 }}>come alive</Hand>
      <P muted style={{ marginTop: 8 }}>Pick a venue, then step through the setup from an empty space to guests arriving.</P>
      <View style={[styles.row, { marginTop: 16 }]}>{(Object.keys(SCENES) as SceneKey[]).map(v => <Chip key={v} label={v} on={v === venue} onPress={() => setVenue(v)} />)}</View>
      <View style={[styles.stage, sticker(5)]}>
        <TourScene venue={venue} stage={stage} />
        <View style={styles.cap}><Hand size={20} color={C.ink} rotate={0}>{venue} · {STAGES[stage]}</Hand></View>
      </View>
      <View style={{ marginTop: 16, gap: 6 }}>
        {STAGES.map((t, i) => (
          <Pressable key={t} onPress={() => { setPlaying(false); if (timer.current) clearInterval(timer.current); setStage(i); }} accessibilityRole="button" accessibilityState={{ selected: i === stage }}
            style={[styles.stepRow, i === stage && { borderColor: C.ink, backgroundColor: C.note }]}>
            <View style={[styles.dot, i <= stage && { backgroundColor: C.brand, borderColor: C.brand }]}><Text style={{ fontFamily: F.heavy, fontSize: 12, color: i <= stage ? '#fff' : C.muted }}>{i + 1}</Text></View>
            <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: i <= stage ? C.ink : C.muted }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, { marginTop: 14 }]}>
        <Btn small kind="accent" title={playing ? 'Stop' : 'Play the setup'} onPress={play} />
        <Btn small title="Book a walkthrough" onPress={() => { update({ idea: [plan.idea, `Please arrange a venue walkthrough (${venue}).`].filter(Boolean).join('\n') }); toast('Walkthrough added to your plan'); router.navigate('/book'); }} />
      </View>

      <View style={{ marginTop: 50 }}>
        <Hand size={24}>Venues</Hand>
        <H size={32} style={{ marginTop: 6 }}>Spaces we source</H>
      </View>
      <View style={[styles.grid, { marginTop: 18 }]}>
        {VENUE_TYPES.map((v, i) => (
          <Pressable key={v.name} onPress={() => { const on = vt === i; setVt(on ? null : i); if (!on) { update({ venue: v.name }); toast(`${v.name} added to your plan`); } }}
            accessibilityRole="button" accessibilityState={{ selected: vt === i }}
            style={[styles.vt, sticker(3), { transform: [{ rotate: `${i % 2 ? 0.7 : -0.8}deg` }] }, vt === i && { backgroundColor: C.note }]}>
            <Hand size={18} rotate={0}>{v.capacity}</Hand>
            <Text style={{ fontFamily: F.black, fontSize: 15, color: C.ink }}>{v.name}</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: C.muted }}>{v.goodFor}</Text>
          </Pressable>
        ))}
      </View>
      <Btn kind="dark" title="Request a corporate proposal" style={{ marginTop: 20, alignSelf: 'flex-start' }} onPress={() => { setOccasion('Corporate Event'); router.navigate('/book'); }} />

      <View style={{ marginTop: 50 }}>
        <Hand size={24}>Layouts</Hand>
        <H size={32} style={{ marginTop: 6 }}>Seating styles</H>
        <P muted style={{ marginTop: 6 }}>Guide capacities for a 500 m² hall.</P>
      </View>
      <View style={[styles.grid, { marginTop: 16 }]}>
        {SETUP_STYLES.map((s, i) => (
          <Pressable key={s.name} onPress={() => { const on = seat === i; setSeat(on ? null : i); update({ seating: on ? 'Not sure' : s.name }); }}
            accessibilityRole="button" accessibilityState={{ selected: seat === i }} style={[styles.seat, sticker(2), seat === i && { backgroundColor: C.note }]}>
            <Text style={{ fontFamily: F.black, fontSize: 15, color: C.ink }}>{s.name}</Text>
            <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.muted }}>up to {s.capacity.toLocaleString('en-US')}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stage: { marginTop: 16, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.cream, overflow: 'hidden' },
  cap: { position: 'absolute', left: 10, bottom: 10, backgroundColor: C.note, borderWidth: 1.5, borderColor: C.ink, paddingHorizontal: 10, transform: [{ rotate: '-2deg' }] },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: 'transparent', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  vt: { width: '46%', flexGrow: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 14, gap: 4 },
  seat: { width: '30%', flexGrow: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 12, alignItems: 'center' },
});
