import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/chrome';
import { Btn, Chip, Hand, H, P, useToast } from '@/components/ui';
import { CATEGORIES, SERVICE_COUNT } from '@/data/catalog';
import { usePlan } from '@/store/plan';
import { C, F, sticker } from '@/theme';

export default function Services() {
  const params = useLocalSearchParams<{ cat?: string }>();
  const [picked, setPicked] = useState<{ forParam?: string; value: string }>({ value: 'All' });
  const paramCat = params.cat ? String(params.cat) : undefined;
  const cat = picked.forParam === paramCat || !paramCat ? picked.value : paramCat;
  const setCat = (v: string) => setPicked({ forParam: paramCat, value: v });
  const [q, setQ] = useState('');
  const { plan, toggleService } = usePlan();
  const toast = useToast();


  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CATEGORIES.filter(c => cat === 'All' || c.name === cat)
      .map(c => ({ ...c, services: c.services.filter(x => !s || `${x.name} ${x.note} ${c.name}`.toLowerCase().includes(s)) }))
      .filter(c => c.services.length);
  }, [cat, q]);

  return (
    <Screen>
      <Hand size={24}>Services</Hand>
      <H size={38} style={{ marginTop: 6 }}>Compose your</H>
      <Hand size={46} style={{ marginTop: -4 }}>event</Hand>
      <P muted style={{ marginTop: 8 }}>Tap + to add any service to your plan. Your planner confirms availability and pricing.</P>
      <TextInput value={q} onChangeText={setQ} placeholder={`Search ${SERVICE_COUNT} services…`} placeholderTextColor={C.muted}
        style={[styles.search, sticker(3)]} accessibilityLabel="Search services" returnKeyType="search" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        {['All', ...CATEGORIES.map(c => c.name)].map(n => <Chip key={n} label={n} on={n === cat} onPress={() => setCat(n)} />)}
      </ScrollView>

      {groups.length === 0 ? (
        <View style={{ marginTop: 30, gap: 12 }}>
          <Hand size={26} color={C.muted} rotate={0}>Nothing matches “{q}”.</Hand>
          <Btn small title="Ask Nina instead" onPress={() => router.push({ pathname: '/nina', params: { q: `Do you offer ${q}?` } })} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : groups.map(g => (
        <View key={g.name} style={{ marginTop: 34 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <Text style={{ fontFamily: F.black, fontSize: 22, color: C.ink, flexShrink: 1 }}>{g.name}</Text>
            <Hand size={24} rotate={0}>{g.services.length}</Hand>
          </View>
          <View style={{ gap: 8 }}>
            {g.services.map(s => {
              const on = plan.services.includes(s.name);
              return (
                <Pressable key={s.name} onPress={() => { const added = toggleService(s.name); toast(added ? `Added ${s.name}` : `Removed ${s.name}`); }}
                  accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${on ? 'Remove' : 'Add'} ${s.name}`}
                  style={[styles.row, on && { borderColor: C.ink, backgroundColor: C.brandSoft }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.heavy, fontSize: 14.5, color: C.ink }}>{s.name}</Text>
                    {s.note ? <Text style={{ fontFamily: F.regular, fontSize: 12.5, color: C.muted }}>{s.note}</Text> : null}
                  </View>
                  <View style={[styles.add, on && { backgroundColor: C.brand, borderColor: C.brand }]}>
                    <Text style={{ fontFamily: F.heavy, fontSize: 17, color: on ? '#fff' : C.ink }}>{on ? '✓' : '+'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginTop: 18, borderWidth: 1.5, borderColor: C.ink, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, fontFamily: F.semi, fontSize: 15, backgroundColor: C.card, color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.line, paddingVertical: 12, paddingHorizontal: 14 },
  add: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card },
});
