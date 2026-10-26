// App-wide settings. Values starting with EXPO_PUBLIC_ can be set in a .env file (see .env.example).

export const BRAND = {
  name: 'NILNA Events',
  parent: 'NILNA Events Management',
  whatsapp: '971585649298', // international format, no "+"
  whatsappDisplay: '+971 58 564 9298',
  email: 'info@nilnaevents.com',
  website: 'https://nilnaevents.com',
  city: 'Dubai, United Arab Emirates',
};

/** Optional backend (see /server). When empty, the app works offline:
 *  Nina uses her built-in answers and bookings are kept on this device only. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** PIN that unlocks the staff dashboard on this device. Change before release.
 *  With a backend, the server also checks the staff key (EXPO_PUBLIC_STAFF_KEY / STAFF_KEY). */
export const STAFF_PIN = process.env.EXPO_PUBLIC_STAFF_PIN ?? '2026';
export const STAFF_KEY = process.env.EXPO_PUBLIC_STAFF_KEY ?? '';

export const WEDDING_OFFER = {
  title: 'Free henna night setup!',
  body: 'Confirm a Signature or Royal wedding before 31 December 2026 and we style your henna night: majlis setup, florals and hospitality staff included.',
};
