import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Hand, useToast } from '@/components/ui';
import { API_URL } from '@/config';
import { PACKAGES } from '@/data/catalog';
import { GREETING } from '@/lib/locale';
import { askNina, NINA_SUGGESTIONS, NinaAction, NinaMsg } from '@/lib/nina';
import { openWhatsApp, planMessage } from '@/lib/whatsapp';
import { usePlan } from '@/store/plan';
import { C, F } from '@/theme';

export default function Nina() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const ctx = usePlan();
  const { plan, lang, currency, budgetLabel, choosePackage, toggleService } = ctx;
  const toast = useToast();
  const [msgs, setMsgs] = useState<NinaMsg[]>(() => [{
    role: 'assistant', text: GREETING[lang],
    actions: [
      { kind: 'book', label: 'Book an event' },
      { kind: 'human', label: 'WhatsApp a planner' },
    ],
  }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  const list = useRef<FlatList<NinaMsg>>(null);
  const asked = useRef(false);

  useEffect(() => () => ctl.current?.abort(), []);
  useEffect(() => {
    if (params.q && !asked.current) { asked.current = true; send(String(params.q)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: NinaMsg[] = [...msgs, { role: 'user', text: t }];
    setMsgs(next); setInput(''); setBusy(true);
    ctl.current = new AbortController();
    try {
      const r = await askNina(next.slice(1), plan, lang, ctl.current.signal);
      if (r.showGroup) choosePackage(r.showGroup, null);
      r.addServices?.forEach(s => toggleService(s, true));
      if (r.addServices?.length) toast(`${r.addServices.length} service${r.addServices.length > 1 ? 's' : ''} added to your plan`);
      setMsgs(m => [...m, { role: 'assistant', text: r.text, actions: r.actions }]);
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setMsgs(m => [...m, { role: 'assistant', text: "Sorry, I couldn't answer just now. A planner can help right away on WhatsApp.", actions: [{ kind: 'human', label: 'WhatsApp a planner' }] }]);
    } finally {
      setBusy(false);
      setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    }
  }

  function act(a: NinaAction) {
    switch (a.kind) {
      case 'addPackage':
        choosePackage(a.group, a.index);
        toast(`${PACKAGES[a.group].list[a.index].name} added to your plan`);
        setMsgs(m => [...m, { role: 'assistant', text: `${PACKAGES[a.group].list[a.index].name} is in your plan. Ready to book?`, actions: [{ kind: 'book', label: 'Open booking' }, { kind: 'human', label: 'WhatsApp a planner' }] }]);
        break;
      case 'showGroup': choosePackage(a.group, null); router.dismissTo('/packages'); break;
      case 'addService': { const added = toggleService(a.service, true); toast(added ? `Added ${a.service}` : `${a.service} is already in your plan`); break; }
      case 'book': router.dismissTo('/book'); break;
      case 'browse': router.dismissTo('/services'); break;
      case 'human': openWhatsApp(ctx.itemCount ? planMessage(plan, { lang, currency, budgetLabel }) : `Hi NILNA Events, I'd like to speak to a planner.${lang !== 'English' ? ` Preferred language: ${lang}.` : ''}`); break;
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}>
        <View style={styles.av}><Text style={{ fontFamily: F.hand, fontSize: 30, color: C.brand, marginTop: -3 }}>N</Text><View style={styles.online} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.black, fontSize: 18, color: C.ink }}>Nina</Text>
          <Text style={{ fontFamily: F.semi, fontSize: 12, color: C.muted }}>{API_URL ? 'AI event planner · online' : 'Event assistant · online'}</Text>
        </View>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close chat" hitSlop={10}><Ionicons name="close" size={28} color={C.ink} /></Pressable>
      </View>
      <Pressable onPress={() => act({ kind: 'human', label: '' })} style={styles.handoff} accessibilityRole="button">
        <Text style={{ fontFamily: F.bold, fontSize: 12.5, color: '#0B5132' }}>Want a real person?</Text>
        <Text style={{ fontFamily: F.heavy, fontSize: 12.5, color: '#0B5132' }}>WhatsApp a planner →</Text>
      </Pressable>
      <FlatList
        ref={list}
        data={msgs}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={{ gap: 6, alignItems: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <View style={[styles.bubble, item.role === 'user' ? styles.me : styles.nina]}>
              <Text style={{ fontFamily: F.regular, fontSize: 14.5, lineHeight: 21, color: item.role === 'user' ? '#fff' : C.ink }}>{item.text}</Text>
            </View>
            {item.actions?.length ? (
              <View style={styles.acts}>
                {item.actions.map((a, i) => (
                  <Pressable key={i} onPress={() => act(a)} style={[styles.act, a.kind === 'human' && { backgroundColor: C.wa }]} accessibilityRole="button">
                    <Text style={{ fontFamily: F.heavy, fontSize: 12.5, color: a.kind === 'human' ? C.waInk : C.ink }}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <View style={{ gap: 10, marginTop: 4 }}>
            {busy ? <View style={[styles.bubble, styles.nina, { flexDirection: 'row', gap: 8, alignSelf: 'flex-start' }]}><ActivityIndicator size="small" color={C.brand} /><Text style={{ fontFamily: F.regular, color: C.muted }}>Thinking…</Text></View> : null}
            {msgs.length === 1 ? (
              <View style={styles.acts}>
                {NINA_SUGGESTIONS.map(s => <Pressable key={s} onPress={() => send(s)} style={styles.suggest} accessibilityRole="button"><Hand size={18} color={C.ink} rotate={0}>{s}</Hand></Pressable>)}
              </View>
            ) : null}
          </View>
        }
      />
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput value={input} onChangeText={setInput} placeholder="Ask Nina about your event…" placeholderTextColor={C.muted} multiline style={styles.input}
          onSubmitEditing={() => send(input)} blurOnSubmit accessibilityLabel="Message Nina" />
        <Pressable onPress={() => send(input)} disabled={busy || !input.trim()} style={[styles.send, (busy || !input.trim()) && { opacity: 0.45 }]} accessibilityRole="button" accessibilityLabel="Send">
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.note}>Nina is an AI and can make mistakes. A planner confirms every booking.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.note, borderBottomWidth: 1.5, borderColor: C.ink },
  av: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  online: { position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 7, backgroundColor: C.wa, borderWidth: 2, borderColor: C.note },
  handoff: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 9, backgroundColor: '#EAFBF1', borderBottomWidth: 1, borderColor: '#CDEEDB' },
  bubble: { maxWidth: '86%', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16 },
  nina: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, borderBottomLeftRadius: 4 },
  me: { backgroundColor: C.ink, borderBottomRightRadius: 4 },
  acts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, maxWidth: '94%' },
  act: { borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.note, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  suggest: { borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.note, paddingVertical: 4, paddingHorizontal: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 10, borderTopWidth: 1.5, borderColor: C.ink, backgroundColor: C.card },
  input: { flex: 1, borderWidth: 1.5, borderColor: C.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, maxHeight: 110, minHeight: 44, fontFamily: F.regular, fontSize: 15, color: C.ink },
  send: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: C.ink, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: F.regular, fontSize: 11, color: C.muted, textAlign: 'center', paddingBottom: 8, backgroundColor: C.card },
});
