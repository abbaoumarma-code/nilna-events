import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { C, F, sticker } from '@/theme';

/* ---------- type ---------- */
export function H({ children, size = 34, style, ...rest }: TextProps & { size?: number; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[{ fontFamily: F.black, fontSize: size, lineHeight: size * 1.06, color: C.ink, letterSpacing: -size * 0.03 }, style]}>{children}</Text>;
}
/** The handwritten orange accent word. */
export function Hand({ children, size = 26, color = C.brand, style, rotate = -2 }: { children: React.ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle>; rotate?: number }) {
  return <Text style={[{ fontFamily: F.hand, fontSize: size, lineHeight: size * 1.05, color, transform: [{ rotate: `${rotate}deg` }] }, style]}>{children}</Text>;
}
export function P({ children, style, muted, ...rest }: TextProps & { muted?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[{ fontFamily: F.regular, fontSize: 15, lineHeight: 23, color: muted ? C.muted : C.ink2 }, style]}>{children}</Text>;
}
export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: F.heavy, fontSize: 11.5, letterSpacing: 1.4, textTransform: 'uppercase', color: C.muted, marginBottom: 8 }, style]}>{children}</Text>;
}

export function Section({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <View style={{ marginTop: 52, marginBottom: 22 }}>
      <Label style={{ color: C.brand }}>{kicker}</Label>
      <H size={32}>{title}</H>
      <Hand size={40} style={{ marginTop: -2 }}>{accent}</Hand>
    </View>
  );
}

/* ---------- buttons ---------- */
type BtnKind = 'default' | 'dark' | 'accent' | 'wa';
export function Btn({ title, onPress, kind = 'default', small, icon, style, disabled, accessibilityLabel }: {
  title: string; onPress?: () => void; kind?: BtnKind; small?: boolean; icon?: keyof typeof Ionicons.glyphMap; style?: StyleProp<ViewStyle>; disabled?: boolean; accessibilityLabel?: string;
}) {
  const bg = { default: C.card, dark: C.ink, accent: C.brand, wa: C.wa }[kind];
  const fg = { default: C.ink, dark: '#fff', accent: '#fff', wa: C.waInk }[kind];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.btn, small && styles.btnSm, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, sticker(pressed ? 1 : small ? 2 : 3), pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] }, style]}>
      {icon ? <Ionicons name={icon} size={small ? 15 : 17} color={fg} /> : null}
      <Text style={{ fontFamily: F.heavy, fontSize: small ? 13 : 14.5, color: fg }}>{title}</Text>
    </Pressable>
  );
}
export function LinkText({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}><Text style={{ fontFamily: F.heavy, fontSize: 14, color: C.ink, textDecorationLine: 'underline', textDecorationColor: C.brand }}>{title}</Text></Pressable>;
}

/* ---------- chips ---------- */
export function Chip({ label, on, onPress, dark }: { label: string; on?: boolean; onPress?: () => void; dark?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress}
      style={[styles.chip, on && (dark ? { backgroundColor: C.ink, borderColor: C.ink } : { backgroundColor: C.ink, borderColor: C.ink })]}>
      <Text style={{ fontFamily: F.bold, fontSize: 13.5, color: on ? '#fff' : C.ink }}>{label}</Text>
    </Pressable>
  );
}
export function ChipRow({ options, value, onChange, labels }: { options: string[]; value: string; onChange: (v: string) => void; labels?: Record<string, string> }) {
  return <View style={styles.row}>{options.map(o => <Chip key={o} label={labels?.[o] ?? o} on={o === value} onPress={() => onChange(o)} />)}</View>;
}

/* ---------- moodboard pieces ---------- */
export function Tape({ left = '50%', rotate = -3, width = 80 }: { left?: `${number}%` | number; rotate?: number; width?: number }) {
  return <View pointerEvents="none" style={{ position: 'absolute', top: -10, left, width, height: 22, marginLeft: typeof left === 'string' ? -width / 2 : 0, backgroundColor: C.tape, transform: [{ rotate: `${rotate}deg` }], zIndex: 2 }} />;
}
export function Pin({ children, tilt = 0, style, bg = C.card, tape = true, onPress }: { children: React.ReactNode; tilt?: number; style?: StyleProp<ViewStyle>; bg?: string; tape?: boolean; onPress?: () => void }) {
  const body = (
    <View style={[styles.pin, { backgroundColor: bg, transform: [{ rotate: `${tilt}deg` }] }, style]}>
      {tape ? <Tape /> : null}
      {children}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.85 }}>{body}</Pressable> : body;
}
export function Sticky({ children, color = C.note, tilt = -1.5, style }: { children: React.ReactNode; color?: string; tilt?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.sticky, { backgroundColor: color, transform: [{ rotate: `${tilt}deg` }] }, style]}>{children}</View>;
}

const ART: Record<string, [string, string, string]> = {
  celebration: ['#F6EFE6', '#E3C27F', '#C9952F'],
  wedding: ['#F3E6DC', '#E9C9B8', '#B08D57'],
  proposal: ['#4A1F22', '#A8333A', '#FF9B8A'],
  corporate: ['#0B1A33', '#2C3445', '#C9952F'],
  henna: ['#3A2416', '#7A4A23', '#F4C27A'],
  hero: ['#2B1D16', '#7A3B1D', '#FF9A5C'],
};
/** Generated art standing in for event photography. Replace with real photos (see README). */
export function Art({ kind = 'celebration', height = 200, style }: { kind?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const [a, b, c] = ART[kind] ?? ART.celebration;
  const dots = Array.from({ length: 16 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 90, r: 6 + ((i * 7) % 18) }));
  return (
    <View style={[{ height, overflow: 'hidden' }, style]}>
      <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        {dots.map((d, i) => <Circle key={i} cx={d.x} cy={d.y} r={d.r / 4} fill={i % 3 ? c : '#ffffff'} opacity={0.35 + (i % 4) * 0.12} />)}
      </Svg>
    </View>
  );
}
export function Polaroid({ kind, caption, tilt = 2, height = 210 }: { kind: string; caption: string; tilt?: number; height?: number }) {
  return (
    <View style={[styles.polaroid, { transform: [{ rotate: `${tilt}deg` }] }]}>
      <Tape left={36} rotate={-8} width={86} />
      <Art kind={kind} height={height} />
      <Hand size={22} color={C.ink} rotate={0} style={{ textAlign: 'center', marginTop: 10 }}>{caption}</Hand>
    </View>
  );
}

/** White paper with a faint dot grid, like the web moodboard. */
export function DotPaper({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Defs>
        <Pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><Circle cx="2" cy="2" r="1.2" fill={C.dot} /></Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  );
}

/* ---------- toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [op] = useState(() => new Animated.Value(0));
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    Animated.timing(op, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }).start(), 2000);
  }, [op]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.toast, sticker(3), { opacity: op }]} accessibilityLiveRegion="polite">
        <Text style={{ fontFamily: F.heavy, fontSize: 14, color: C.ink }}>{msg}</Text>
      </Animated.View>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1.5, borderColor: C.ink },
  btnSm: { paddingVertical: 8, paddingHorizontal: 14 },
  chip: { borderWidth: 1.5, borderColor: C.line, backgroundColor: C.card, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pin: { borderWidth: 1.5, borderColor: C.ink, padding: 18, shadowColor: C.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 3 },
  sticky: { padding: 16, shadowColor: C.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 10, elevation: 2 },
  polaroid: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.ink, padding: 10, paddingBottom: 14, shadowColor: C.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  toast: { position: 'absolute', alignSelf: 'center', bottom: 110, backgroundColor: C.note, borderWidth: 1.5, borderColor: C.ink, paddingVertical: 10, paddingHorizontal: 18, transform: [{ rotate: '-1deg' }] },
});
