import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, ScrollViewProps, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND } from '@/config';
import { LANGS } from '@/lib/locale';
import { openWhatsApp, planMessage } from '@/lib/whatsapp';
import { usePlan } from '@/store/plan';
import { C, F, sticker } from '@/theme';
import { DotPaper } from './ui';

/** Language + currency strip and logo, shown at the top of every main screen. */
export function TopBar() {
  const insets = useSafeAreaInsets();
  const { lang, setLang, currency, setCurrency, itemCount } = usePlan();
  return (
    <View style={{ backgroundColor: C.paper }}>
      <View style={[s.lang, { paddingTop: insets.top + 6 }]}>
        <Text style={{ fontFamily: F.hand, fontSize: 18, color: '#E6C27A' }}>We speak</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingRight: 8 }} style={{ flex: 1 }}>
          {LANGS.map(l => (
            <Pressable key={l.key} onPress={() => setLang(l.key)} accessibilityRole="button" accessibilityState={{ selected: lang === l.key }}
              style={[s.langBtn, lang === l.key && { backgroundColor: C.brand, borderColor: C.brand }]}>
              <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: '#fff' }}>{l.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={s.cur}>
          {(['AED', 'USD'] as const).map(c => (
            <Pressable key={c} onPress={() => setCurrency(c)} accessibilityRole="button" accessibilityState={{ selected: currency === c }} style={[s.curBtn, currency === c && { backgroundColor: '#fff' }]}>
              <Text style={{ fontFamily: F.heavy, fontSize: 11, color: currency === c ? C.ink : '#cfc7bc' }}>{c}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={s.head}>
        <Pressable onPress={() => router.navigate('/')} accessibilityRole="link" accessibilityLabel="NILNA Events home">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={require('../../assets/nilna-logo.png')} style={s.badge} accessibilityIgnoresInvertColors />
            <View>
              <Text style={s.wordmark}>NILNA</Text>
              <Text style={s.eventTag}>EVENTS</Text>
            </View>
          </View>
        </Pressable>
        <Pressable onPress={() => router.navigate('/book')} style={[s.plan, sticker(2)]} accessibilityRole="button" accessibilityLabel={`My plan, ${itemCount} items`}>
          <Text style={{ fontFamily: F.heavy, fontSize: 13, color: C.ink }}>My plan</Text>
          <View style={s.count}><Text style={{ fontFamily: F.heavy, fontSize: 12, color: '#fff' }}>{itemCount}</Text></View>
        </Pressable>
      </View>
    </View>
  );
}

/** Scrollable dotted-paper screen body with room for the floating dock. */
export function Screen({ children, ...rest }: ScrollViewProps & { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar />
      <View style={{ flex: 1 }}>
        <DotPaper />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, paddingBottom: 150 }} {...rest}>{children}</ScrollView>
        <Dock />
      </View>
    </View>
  );
}

/** Nina + "talk to a human" buttons, always within thumb reach. */
export function Dock() {
  const { plan, lang, currency, budgetLabel, itemCount } = usePlan();
  const talk = () => openWhatsApp(itemCount ? planMessage(plan, { lang, currency, budgetLabel }) : `Hi ${BRAND.name}, I'd like to speak to a planner.${lang !== 'English' ? ` Preferred language: ${lang}.` : ''}`);
  return (
    <View style={s.dock} pointerEvents="box-none">
      <Pressable onPress={talk} style={[s.dockBtn, { backgroundColor: C.wa }, sticker(3)]} accessibilityRole="button" accessibilityLabel="Talk to a human on WhatsApp">
        <Ionicons name="logo-whatsapp" size={26} color={C.waInk} />
      </Pressable>
      <Pressable onPress={() => router.push('/nina')} style={[s.dockBtn, { backgroundColor: C.ink }, sticker(3)]} accessibilityRole="button" accessibilityLabel="Ask Nina, the AI planner">
        <Text style={{ fontFamily: F.hand, fontSize: 32, color: C.brand, marginTop: -4 }}>N</Text>
        <View style={s.online} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  lang: { backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 7 },
  langBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  cur: { flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999, padding: 2 },
  curBtn: { borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1.5, borderColor: C.ink, backgroundColor: C.paper },
  badge: { width: 46, height: 46, borderRadius: 23 },
  wordmark: { fontFamily: F.black, fontSize: 24, letterSpacing: 4, color: C.ink, lineHeight: 26 },
  eventTag: { fontFamily: F.heavy, fontSize: 9, letterSpacing: 6, color: C.brand, marginTop: 3, paddingLeft: 2 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: C.ink, borderRadius: 999, paddingVertical: 6, paddingLeft: 13, paddingRight: 6, backgroundColor: C.note },
  count: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  dock: { position: 'absolute', right: 14, bottom: 16, gap: 12, alignItems: 'center' },
  dockBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.ink },
  online: { position: 'absolute', right: 2, bottom: 2, width: 13, height: 13, borderRadius: 7, backgroundColor: C.wa, borderWidth: 2, borderColor: C.ink },
  av: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
