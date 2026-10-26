// NILNA Events brand on a planner's moodboard: white dotted paper, orange tape, sticky notes.
export const C = {
  paper: '#FFFFFF',
  dot: '#ECE6DD',
  card: '#FFFFFF',
  cream: '#FAF6EF',
  note: '#FFF3C9',
  note2: '#FDE3D6',
  note3: '#E3F1EA',
  ink: '#151311',
  ink2: '#3D3833',
  muted: '#7A736A',
  line: '#E6DFD4',
  brand: '#ED4308',
  brandDark: '#C93806',
  brandSoft: '#FDEEE6',
  tape: 'rgba(237,67,8,0.75)',
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
