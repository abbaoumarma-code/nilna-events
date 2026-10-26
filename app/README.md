# NILNA Events — mobile app

React Native app (Expo SDK 58, Expo Router, TypeScript) for **NILNA Events** (nilnaevents.com), luxury event planning & decoration in Dubai. It runs on iPhone, Android and the web from one codebase.

## What's inside

| Area | What it does |
| --- | --- |
| **Home** | Moodboard design (dotted paper, taped cards, polaroids, sticky notes), occasions, UAE season (Flag Day / National Day), most-booked packages, wedding offer, departments, journey, why NILNA |
| **Packages** | 30 packages in 10 groups (weddings, proposals, birthdays, baby, private, openings, malls & supermarkets, National Day, Flag Day, corporate) |
| **Services** | All 116 services in 11 categories, searchable, tap + to add to the plan |
| **Venues** | Visual tour (empty room → seating → décor → lighting → guests) for ballroom, beach, villa garden and office; venue types; seating styles |
| **Book** | 4 tap-through steps (occasion → date, guests, emirate, venue → package & budget → name + WhatsApp), plus a one-step "Just call me back". Ends with "Send on WhatsApp" with the full plan pre-written |
| **Nina** | AI event planner chat. Live AI through the server, or built-in answers when offline. Always offers "WhatsApp a planner" |
| **Human** | Floating WhatsApp button on every screen to reach a real planner (+971 58 564 9298) |
| **Languages & currency** | Arabic, English, Hindi, Urdu, French preference at the top (passed to Nina and the planner); AED / USD switch for budgets and quotes |
| **Staff dashboard** | PIN-protected (Home → footer → Staff dashboard): KPIs, bookings by occasion, bookings list with status (New → Contacted → Quoted → Confirmed → Completed / Cancelled), notes, WhatsApp the customer, delete; customers grouped by phone; add booking by hand; import a pasted WhatsApp booking message; export CSV |

## Run it

```bash
npm install
cp .env.example .env        # optional: set the server URL and staff PIN
npx expo start              # press i (iOS), a (Android) or w (web), or scan the QR code with Expo Go
```

The date picker uses a native module. It works in Expo Go; for store builds use EAS:

```bash
npx eas-cli@latest build --platform all
```

Checks: `npm run typecheck` and `npm run lint` (both pass), `npx expo-doctor` (20/20).

## The server (live Nina + central bookings)

Without a server the app still works: Nina uses built-in answers and bookings are saved on the device that made them (useful for a shop tablet). To give Nina real AI and collect every customer's booking in one dashboard, run the small server in `/server`:

```bash
cd server
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY and a long random STAFF_KEY
npm start                   # http://localhost:8787
```

Then set `EXPO_PUBLIC_API_URL` in the app's `.env` to the server address (e.g. `https://api.nilnaevents.com`). In the staff build, also set `EXPO_PUBLIC_STAFF_KEY` to the same value as the server's `STAFF_KEY`.

- `POST /api/bookings` — customers create bookings (no key)
- `GET / PUT / DELETE /api/bookings` — staff only (`x-staff-key` header)
- `POST /api/nina` — Nina's AI replies (uses the Claude API; model set by `NINA_MODEL`)

Bookings are stored in `server/data/bookings.json`. For production, host the server (Render, Railway, Fly.io or a VPS) behind HTTPS and back up that file, or swap it for a database.

## Customise

- **Contact details, offer text, staff PIN:** `src/config.ts`
- **Packages, services, occasions, venues:** `src/data/catalog.ts` (the server reads the same file)
- **Colours and fonts:** `src/theme.ts` (signature orange `#ED4308`, Montserrat + Caveat)
- **Photos:** the polaroids use generated artwork in `Art` (`src/components/ui.tsx`). Replace with real event photos by putting images in `assets/` and swapping `<Art>` for `<Image>`.

## Before publishing

- Change the staff PIN and set a strong `STAFF_KEY`.
- Confirm the wedding offer (free henna night, 31 Dec 2026 deadline).
- Replace the app icon and splash in `assets/` with NILNA Events artwork.
- Add a privacy policy URL (required by the App Store and Google Play because the app collects names and phone numbers).
