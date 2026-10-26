import React from 'react';
import { Text, View } from 'react-native';

import { GroupKey, PACKAGES } from '@/data/catalog';
import { usePlan } from '@/store/plan';
import { C, F } from '@/theme';
import { Btn, Hand, Pin, useToast } from './ui';

export function PackageCard({ group, index, showGroup, tilt = 0 }: { group: GroupKey; index: number; showGroup?: boolean; tilt?: number }) {
  const { plan, choosePackage } = usePlan();
  const toast = useToast();
  const p = PACKAGES[group].list[index];
  const selected = plan.group === group && plan.packageIndex === index;
  return (
    <Pin tilt={tilt} bg={p.featured ? C.note : C.card} style={{ padding: 0 }}>
      {p.featured ? (
        <View style={{ position: 'absolute', top: 14, right: -8, backgroundColor: C.brand, borderWidth: 1.5, borderColor: C.ink, paddingHorizontal: 10, transform: [{ rotate: '6deg' }], zIndex: 3 }}>
          <Hand size={18} color="#fff" rotate={0}>Most booked</Hand>
        </View>
      ) : null}
      <View style={{ padding: 20, paddingBottom: 12 }}>
        {showGroup ? <Text style={{ fontFamily: F.heavy, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: C.muted }}>{PACKAGES[group].label}</Text> : null}
        <Text style={{ fontFamily: F.black, fontSize: 24, color: C.ink, marginTop: 4, letterSpacing: -0.6 }}>{p.name}</Text>
        <Text style={{ fontFamily: F.regular, fontSize: 13.5, color: C.muted, marginTop: 2 }}>{p.for}</Text>
      </View>
      <View style={{ borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, marginHorizontal: 20 }} />
      <View style={{ padding: 20, paddingTop: 14, gap: 7 }}>
        {p.includes.map(f => (
          <View key={f} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontFamily: F.black, color: C.brand }}>✓</Text>
            <Text style={{ fontFamily: F.regular, fontSize: 14, color: C.ink2, flex: 1 }}>{f}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}>
        <Hand size={18} color={C.muted} rotate={0}>Quoted per event</Hand>
        <Btn small kind={selected ? 'accent' : 'default'} title={selected ? '✓ In my plan' : 'Add to plan'}
          onPress={() => { choosePackage(group, selected ? null : index); toast(selected ? 'Package removed' : `${p.name} added to your plan`); }} />
      </View>
    </Pin>
  );
}
