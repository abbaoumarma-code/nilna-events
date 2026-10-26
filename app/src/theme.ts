// NILNA Events brand on a planner's moodboard: white dotted paper, gold tape, navy ink, sticky notes.
export const C = {
  paper: '#FFFFFF',
  dot: '#E4E2DC',
  card: '#FFFFFF',
  cream: '#FAF6EF',
  note: '#FBF4E1',
  note2: '#E9EEF6',
  note3: '#F3EEE4',
  ink: '#0B1A33',
  ink2: '#2E3A52',
  muted: '#5F6878',
  line: '#E3E0D7',
  brand: '#94690F',
  brandDark: '#6F4F0B',
  brandSoft: '#F7EFDC',
  tape: 'rgba(201,149,47,0.78)',
  gold: '#C9952F',
  wa: '#25D366',
  waInk: '#06331A',
  ok: '#2F7D5B',
  warn: '#B7791F',
  bad: '#B42318',
  info: '#2C5F8A',
};

export const F = {
  regular: 'Montserrat_500Medium',
  semi: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  heavy: 'Montserrat_800ExtraBold',
  black: 'Montserrat_900Black',
  hand: 'Caveat_700Bold',
};

/** Hard "sticker" shadow used on buttons and cards. */
export const sticker = (size = 3) => ({
  shadowColor: C.ink,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 1,
});

export const STATUS_COLORS: Record<string, string> = {
  New: C.brand,
  Contacted: C.info,
  Quoted: C.warn,
  Confirmed: C.ok,
  Completed: C.ink2,
  Cancelled: C.muted,
};
