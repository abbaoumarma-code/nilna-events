export type Lang = 'English' | 'Arabic' | 'Hindi' | 'Urdu' | 'French';
export type Currency = 'AED' | 'USD';

export const LANGS: { key: Lang; label: string; rtl: boolean }[] = [
  { key: 'English', label: 'English', rtl: false },
  { key: 'Arabic', label: 'العربية', rtl: true },
  { key: 'Hindi', label: 'हिन्दी', rtl: false },
  { key: 'Urdu', label: 'اردو', rtl: true },
  { key: 'French', label: 'Français', rtl: false },
];

export const GREETING: Record<Lang, string> = {
  English: 'Welcome to NILNA Events, how can I help you today?',
  Arabic: 'مرحباً بك في نيلنا للفعاليات، كيف يمكنني مساعدتك اليوم؟',
  Hindi: 'NILNA Events में आपका स्वागत है, आज मैं आपकी कैसे मदद कर सकती हूँ?',
  Urdu: 'NILNA Events میں خوش آمدید، آج میں آپ کی کیا مدد کر سکتی ہوں؟',
  French: "Bienvenue chez NILNA Events, comment puis-je vous aider aujourd'hui ?",
};

/** AED is pegged to the US dollar at 3.6725. Budget bands are rounded for readability. */
export const PEG = 3.6725;
export const BUDGETS: Record<Currency, string[]> = {
  AED: ['Prefer not to say', 'Under AED 5,000', 'AED 5,000 – 20,000', 'AED 20,000 – 75,000', 'AED 75,000 – 200,000', 'AED 200,000+'],
  USD: ['Prefer not to say', 'Under USD 1,400', 'USD 1,400 – 5,500', 'USD 5,500 – 20,000', 'USD 20,000 – 55,000', 'USD 55,000+'],
};

export const GUESTS = ['Up to 30', '30 – 100', '100 – 300', '300 – 1,000', '1,000+'];
export const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
export const VENUES = ['Home or villa', 'Office', 'Hotel ballroom', 'Restaurant', 'Outdoor or beach', 'Hospital room', 'Mall or store', 'Yacht', 'Desert camp', 'Not decided'];
export const SEATING = ['Not sure', 'Theatre', 'Classroom', 'U-shape', 'Banquet', 'Cabaret', 'Cocktail'];
