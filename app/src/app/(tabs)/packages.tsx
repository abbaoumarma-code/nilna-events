import React from 'react';
import { ScrollView, View } from 'react-native';

import { Screen } from '@/components/chrome';
import { PackageCard } from '@/components/PackageCard';
import { Chip, Hand, H, P } from '@/components/ui';
import { GROUP_ORDER, PACKAGES } from '@/data/catalog';
import { usePlan } from '@/store/plan';

export default function Packages() {
  const { plan, choosePackage } = usePlan();
  const group = plan.group;
  return (
    <Screen>
      <Hand size={24}>Packages</Hand>
      <H size={38} style={{ marginTop: 6 }}>Curated</H>
      <Hand size={46} style={{ marginTop: -4 }}>collections</Hand>
      <P muted style={{ marginTop: 8 }}>Starting points you can tailor. Every event is quoted individually in AED or USD.</P>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18, marginHorizontal: -18 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 18 }}>
        {GROUP_ORDER.map(k => <Chip key={k} label={PACKAGES[k].label} on={k === group} onPress={() => choosePackage(k, plan.group === k ? plan.packageIndex : null)} />)}
      </ScrollView>
      <View style={{ gap: 34, marginTop: 34 }}>
        {PACKAGES[group].list.map((_, i) => <PackageCard key={`${group}-${i}`} group={group} index={i} tilt={i === 0 ? -1 : i === 2 ? 1 : 0} />)}
      </View>
    </Screen>
  );
}
