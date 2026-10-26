// NILNA Events catalogue — generated from the web version. Edit freely.
export type GroupKey = "social" | "opening" | "flagday" | "nationalday" | "retail" | "proposal" | "birthday" | "baby" | "wedding" | "corporate";
export interface Occasion { name: string; desc: string; icon: string; group: GroupKey }
export interface Service { name: string; note: string }
export interface Category { name: string; desc: string; services: Service[] }
export interface Package { name: string; for: string; featured: boolean; includes: string[] }
export interface PackageGroup { label: string; list: Package[] }
export interface VenueType { name: string; capacity: string; goodFor: string }
export interface SetupStyle { name: string; capacity: number; kind: string }

export const OCCASIONS: Occasion[] = [
 {
  "name": "Wedding",
  "desc": "Local & destination",
  "icon": "diamond-outline",
  "group": "wedding"
 },
 {
  "name": "Henna & Nikah",
  "desc": "Traditional nights",
  "icon": "moon-outline",
  "group": "wedding"
 },
 {
  "name": "Surprise Proposal",
  "desc": "Home, beach, yacht or desert",
  "icon": "heart-outline",
  "group": "proposal"
 },
 {
  "name": "Birthday",
  "desc": "Home, office & kids",
  "icon": "gift-outline",
  "group": "birthday"
 },
 {
  "name": "Baby Shower",
  "desc": "Showers & reveals",
  "icon": "happy-outline",
  "group": "baby"
 },
 {
  "name": "Welcome Baby",
  "desc": "Hospital or home setup",
  "icon": "heart-outline",
  "group": "baby"
 },
 {
  "name": "Graduation",
  "desc": "Milestone parties",
  "icon": "school-outline",
  "group": "social"
 },
 {
  "name": "Corporate Event",
  "desc": "Launches, galas, festivals",
  "icon": "briefcase-outline",
  "group": "corporate"
 },
 {
  "name": "Conference & Exhibition",
  "desc": "Summits, seminars, stands",
  "icon": "mic-outline",
  "group": "corporate"
 },
 {
  "name": "Grand Opening",
  "desc": "Restaurants, shops & supermarkets",
  "icon": "flag-outline",
  "group": "opening"
 },
 {
  "name": "UAE National Day",
  "desc": "Eid Al Etihad · 2 December",
  "icon": "flag-outline",
  "group": "nationalday"
 },
 {
  "name": "UAE Flag Day",
  "desc": "Flag raising · 3 November",
  "icon": "flag-outline",
  "group": "flagday"
 },
 {
  "name": "Mall & Supermarket",
  "desc": "Promotions, seasons, activations",
  "icon": "cart-outline",
  "group": "retail"
 },
 {
  "name": "Other",
  "desc": "Tell us your idea",
  "icon": "star-outline",
  "group": "social"
 }
];
export const CATEGORIES: Category[] = [
 {
  "name": "Social & private occasions",
  "desc": "Weddings, birthdays, showers, proposals and every milestone in between.",
  "services": [
   {
    "name": "Weddings",
    "note": "Themed, local and destination"
   },
   {
    "name": "Engagements & proposals",
    "note": ""
   },
   {
    "name": "Surprise proposal setups",
    "note": "Home, rooftop, beach, yacht or desert"
   },
   {
    "name": "Henna, mehndi & nikah nights",
    "note": ""
   },
   {
    "name": "Birthday parties",
    "note": "Kids, teens and adults"
   },
   {
    "name": "Home birthday setup",
    "note": "Surprise décor ready before guests arrive"
   },
   {
    "name": "Office birthday setup",
    "note": "Desk, pantry or meeting room"
   },
   {
    "name": "Baby showers & gender reveals",
    "note": ""
   },
   {
    "name": "Newborn welcomes & naming ceremonies",
    "note": "Including mubarakiya"
   },
   {
    "name": "Welcome baby hospital room décor",
    "note": "Ready before mum and baby arrive"
   },
   {
    "name": "Welcome baby home setup",
    "note": "Entrance, living room and guest table"
   },
   {
    "name": "Graduation parties",
    "note": ""
   },
   {
    "name": "Anniversaries",
    "note": ""
   },
   {
    "name": "Housewarmings",
    "note": ""
   },
   {
    "name": "Surprise parties",
    "note": ""
   },
   {
    "name": "Hen parties",
    "note": ""
   },
   {
    "name": "Yacht parties & boat cruises",
    "note": ""
   },
   {
    "name": "Seasonal & National Day celebrations",
    "note": ""
   },
   {
    "name": "UAE Flag Day décor & flag-raising",
    "note": "3 November"
   },
   {
    "name": "UAE National Day office & home décor",
    "note": "Eid Al Etihad, 2 December"
   },
   {
    "name": "UAE National Day heritage celebrations",
    "note": "Ayyala, henna, luqaimat, heritage corner"
   },
   {
    "name": "Flag Day building & façade dressing",
    "note": "Large flags, banners and lighting"
   },
   {
    "name": "Cultural & traditional events",
    "note": ""
   },
   {
    "name": "School events",
    "note": ""
   }
  ]
 },
 {
  "name": "Corporate & MICE",
  "desc": "Meetings, incentives, conferences and exhibitions run to brief.",
  "services": [
   {
    "name": "Conferences & seminars",
    "note": ""
   },
   {
    "name": "Product & brand launches",
    "note": ""
   },
   {
    "name": "Restaurant & shop opening décor",
    "note": "Balloon arch, ribbon cutting, red carpet"
   },
   {
    "name": "Gala dinners",
    "note": ""
   },
   {
    "name": "Award ceremonies",
    "note": ""
   },
   {
    "name": "Team building & retreats",
    "note": ""
   },
   {
    "name": "Family days",
    "note": ""
   },
   {
    "name": "Networking events",
    "note": ""
   },
   {
    "name": "Exhibitions & trade shows",
    "note": ""
   },
   {
    "name": "Roadshows",
    "note": ""
   },
   {
    "name": "Government events",
    "note": ""
   },
   {
    "name": "Incentives & destination management",
    "note": ""
   },
   {
    "name": "Hybrid & virtual events",
    "note": ""
   },
   {
    "name": "Property launches",
    "note": ""
   },
   {
    "name": "CSR & wellness programmes",
    "note": ""
   }
  ]
 },
 {
  "name": "Public & experiential",
  "desc": "Festivals, activations and crowd moments people talk about.",
  "services": [
   {
    "name": "Festivals & concerts",
    "note": ""
   },
   {
    "name": "Sports events",
    "note": ""
   },
   {
    "name": "Brand activations",
    "note": ""
   },
   {
    "name": "Mall & retail activations",
    "note": "Atrium events and brand zones"
   },
   {
    "name": "Supermarket & hypermarket promotions",
    "note": "Sampling booths, promoters, aisle décor"
   },
   {
    "name": "Seasonal mall & store décor",
    "note": "Ramadan, Eid, National Day, festive"
   },
   {
    "name": "Fashion shows",
    "note": ""
   },
   {
    "name": "Street markets, fairs & carnivals",
    "note": ""
   },
   {
    "name": "Pop-up shows",
    "note": ""
   }
  ]
 },
 {
  "name": "Planning & management",
  "desc": "The planning work that keeps every detail on time and on budget.",
  "services": [
   {
    "name": "Full event planning",
    "note": "Concept to completion"
   },
   {
    "name": "Concept & theme design",
    "note": ""
   },
   {
    "name": "Venue sourcing",
    "note": ""
   },
   {
    "name": "Vendor sourcing & coordination",
    "note": ""
   },
   {
    "name": "Budget management",
    "note": ""
   },
   {
    "name": "Guest list & RSVP management",
    "note": ""
   },
   {
    "name": "Invitations & stationery",
    "note": ""
   },
   {
    "name": "On-site & day-of coordination",
    "note": ""
   },
   {
    "name": "Logistics",
    "note": ""
   },
   {
    "name": "Permits & approvals",
    "note": ""
   },
   {
    "name": "Hotel, accommodation & travel",
    "note": ""
   },
   {
    "name": "Event strategy, marketing & PR",
    "note": ""
   },
   {
    "name": "Social media & content creation",
    "note": ""
   },
   {
    "name": "Post-event analysis & ROI",
    "note": ""
   },
   {
    "name": "Seating & floor plans",
    "note": ""
   }
  ]
 },
 {
  "name": "Décor & styling",
  "desc": "Balloons, florals, backdrops and stages designed around your theme.",
  "services": [
   {
    "name": "Balloon décor",
    "note": "Garlands, arches, sculptures"
   },
   {
    "name": "Floral arrangements",
    "note": ""
   },
   {
    "name": "Backdrops & photo walls",
    "note": ""
   },
   {
    "name": "Cake & dessert table styling",
    "note": ""
   },
   {
    "name": "Stage & ballroom design",
    "note": "Including kosha"
   },
   {
    "name": "Table styling & linen",
    "note": ""
   },
   {
    "name": "Themed décor",
    "note": ""
   },
   {
    "name": "Social-media-ready installations",
    "note": ""
   },
   {
    "name": "Tents, marquees & canopies",
    "note": ""
   },
   {
    "name": "Majlis & Arabic setups",
    "note": ""
   },
   {
    "name": "Carpets, fabric & drapery",
    "note": ""
   }
  ]
 },
 {
  "name": "Food & hospitality",
  "desc": "Menus, cakes, drinks and the people who serve your guests.",
  "services": [
   {
    "name": "Catering & menu planning",
    "note": ""
   },
   {
    "name": "Themed cakes & desserts",
    "note": ""
   },
   {
    "name": "Mocktail & drinks bars",
    "note": ""
   },
   {
    "name": "Hospitality staff",
    "note": "Arabic coffee, tea and refreshments"
   },
   {
    "name": "Hostesses, ushers & receptionists",
    "note": ""
   },
   {
    "name": "Event staffing",
    "note": ""
   }
  ]
 },
 {
  "name": "Entertainment",
  "desc": "DJs, live acts, kids entertainers and headline talent.",
  "services": [
   {
    "name": "DJs",
    "note": ""
   },
   {
    "name": "Live music & bands",
    "note": "Including oud and traditional bands"
   },
   {
    "name": "Performers, dancers & stage shows",
    "note": ""
   },
   {
    "name": "Celebrity & artist booking",
    "note": ""
   },
   {
    "name": "Kids entertainers",
    "note": "Magicians, clowns, mascots, characters"
   },
   {
    "name": "Face painting",
    "note": ""
   },
   {
    "name": "Arts & crafts workshops",
    "note": ""
   },
   {
    "name": "Bouncy castles & inflatables",
    "note": ""
   },
   {
    "name": "Games hosts & interactive activities",
    "note": ""
   },
   {
    "name": "Singing telegrams",
    "note": ""
   }
  ]
 },
 {
  "name": "Production & technology",
  "desc": "Sound, light, LED, staging and builds by an in-house crew.",
  "services": [
   {
    "name": "Sound systems",
    "note": ""
   },
   {
    "name": "Lighting design",
    "note": ""
   },
   {
    "name": "LED walls & screens",
    "note": ""
   },
   {
    "name": "Staging & trussing",
    "note": ""
   },
   {
    "name": "AV equipment rental",
    "note": ""
   },
   {
    "name": "Special effects",
    "note": "Cold pyro, smoke, haze"
   },
   {
    "name": "3D projection mapping",
    "note": ""
   },
   {
    "name": "Live streaming",
    "note": ""
   },
   {
    "name": "Fabrication & set building",
    "note": ""
   },
   {
    "name": "Exhibition stand building",
    "note": ""
   },
   {
    "name": "Interior fit-outs",
    "note": ""
   },
   {
    "name": "Photo booths",
    "note": ""
   },
   {
    "name": "Event tech & interactive displays",
    "note": ""
   }
  ]
 },
 {
  "name": "Photo & video",
  "desc": "Photographers, films and content ready to share the same day.",
  "services": [
   {
    "name": "Photography",
    "note": ""
   },
   {
    "name": "Videography & event films",
    "note": ""
   },
   {
    "name": "Albums",
    "note": ""
   },
   {
    "name": "Video & content production",
    "note": ""
   }
  ]
 },
 {
  "name": "Rentals & supplies",
  "desc": "Furniture, VIP seating, banquet kit and party supplies.",
  "services": [
   {
    "name": "Furniture rental",
    "note": ""
   },
   {
    "name": "VIP tables & chairs",
    "note": ""
   },
   {
    "name": "Banquet equipment & linen",
    "note": ""
   },
   {
    "name": "Dance floors",
    "note": ""
   },
   {
    "name": "Party supplies",
    "note": ""
   },
   {
    "name": "Costumes",
    "note": ""
   }
  ]
 },
 {
  "name": "Gifts & favours",
  "desc": "Personalised touches guests take home.",
  "services": [
   {
    "name": "Favours & handmade gifts",
    "note": ""
   },
   {
    "name": "Event souvenirs & guest gifting",
    "note": ""
   },
   {
    "name": "Perfume tables",
    "note": ""
   }
  ]
 }
];
export const PACKAGES: Record<GroupKey, PackageGroup> = {
 "social": {
  "label": "Private celebrations",
  "list": [
   {
    "name": "Essential",
    "for": "Home parties up to 30 guests",
    "featured": false,
    "includes": [
     "Theme concept",
     "Balloon décor & backdrop",
     "Cake & dessert table styling",
     "Table styling",
     "Setup & teardown"
    ]
   },
   {
    "name": "Signature",
    "for": "Parties of 30 – 100 guests",
    "featured": true,
    "includes": [
     "Everything in Essential",
     "Floral arrangements",
     "Catering & themed cake",
     "DJ or kids entertainer",
     "Photography",
     "On-site coordinator"
    ]
   },
   {
    "name": "Grand",
    "for": "Venue celebrations of 100+ guests",
    "featured": false,
    "includes": [
     "Everything in Signature",
     "Venue sourcing",
     "Stage, sound & lighting",
     "Videography & photo booth",
     "Favours & guest gifting",
     "Full event planning"
    ]
   }
  ]
 },
 "opening": {
  "label": "Restaurant & shop openings",
  "list": [
   {
    "name": "Soft Opening",
    "for": "Restaurants, cafés, salons and shops",
    "featured": false,
    "includes": [
     "Entrance balloon arch in your brand colours",
     "Grand opening banner & signage",
     "Ribbon-cutting setup with scissors & tray",
     "Floral stands at the entrance",
     "Branded photo wall",
     "Setup before opening & teardown after"
    ]
   },
   {
    "name": "Grand Opening",
    "for": "Restaurant grand opening with invited guests",
    "featured": true,
    "includes": [
     "Everything in Soft Opening",
     "Interior décor & table styling",
     "Red carpet & stanchions",
     "Welcome hostesses & ushers",
     "DJ or live music",
     "Photographer, videographer & social media content",
     "Tasting menu or canapé service setup"
    ]
   },
   {
    "name": "Opening Launch Event",
    "for": "Flagship stores, hypermarkets, supermarkets & malls",
    "featured": false,
    "includes": [
     "Everything in Grand Opening",
     "Stage, sound, lighting & LED screen",
     "MC, performers or celebrity guest",
     "Cold-pyro or confetti moment at ribbon cutting",
     "Influencer & media invitations",
     "Permits & mall or landlord coordination"
    ]
   }
  ]
 },
 "flagday": {
  "label": "UAE Flag Day",
  "list": [
   {
    "name": "Flag Day Essentials",
    "for": "Offices, shops & villas · 3 November",
    "featured": false,
    "includes": [
     "Wall-mounted or desk UAE flags",
     "Entrance & reception décor in flag colours",
     "Red, green, white & black balloon garland",
     "Flag Day banner or welcome sign",
     "Hand flags & pins for staff or family",
     "Installation the day before"
    ]
   },
   {
    "name": "Flag-Raising Ceremony",
    "for": "Companies, schools & government entities",
    "featured": true,
    "includes": [
     "Flagpole supply & installation",
     "Ceremony setup for 11am flag raising",
     "National anthem sound system",
     "Guard of honour or student line-up guidance",
     "Flag-colour décor around the ceremony area",
     "Photographer & short video for social media",
     "Arabic coffee & dates for attendees"
    ]
   },
   {
    "name": "Flag Day Building Dressing",
    "for": "Towers, malls & large facilities",
    "featured": false,
    "includes": [
     "Large-format façade flags & banners",
     "Lobby, atrium & entrance installations",
     "Lighting in flag colours",
     "Safety-rated rigging & height work",
     "Landlord & authority approvals",
     "Removal after the season"
    ]
   }
  ]
 },
 "nationalday": {
  "label": "UAE National Day",
  "list": [
   {
    "name": "National Day Décor",
    "for": "Eid Al Etihad, 2 December · offices, shops & villas",
    "featured": false,
    "includes": [
     "Full office, lobby or villa decoration",
     "UAE flag drapes, bunting & hanging décor",
     "National Day photo backdrop",
     "Balloon arch in flag colours",
     "Majlis corner with Arabic coffee & dates",
     "Installation before the holiday & removal after"
    ]
   },
   {
    "name": "National Day Celebration",
    "for": "Company events, schools & communities",
    "featured": true,
    "includes": [
     "Everything in National Day Décor",
     "Traditional Ayyala or Harbiya performers",
     "Henna artist & Emirati heritage corner",
     "Luqaimat, Arabic coffee & traditional food",
     "Kandura & abaya photo corner",
     "Stage, sound & LED screen",
     "Photo, video & social media content"
    ]
   },
   {
    "name": "National Day Festival",
    "for": "Malls, communities & public events",
    "featured": false,
    "includes": [
     "Everything in National Day Celebration",
     "Heritage village with souq stalls",
     "Fireworks or cold-pyro finale",
     "Kids activities, face painting & mascots",
     "Fabricated photo installations & 3D letters",
     "Hostesses, security & crowd management",
     "Permits & authority approvals"
    ]
   }
  ]
 },
 "retail": {
  "label": "Malls, hypermarkets & supermarkets",
  "list": [
   {
    "name": "In-Store Promotion",
    "for": "Supermarkets & hypermarkets",
    "featured": false,
    "includes": [
     "Promotion zone & aisle-end décor",
     "Branded sampling or tasting booth",
     "Balloon and banner dressing",
     "Promoters & brand ambassadors",
     "Price and offer signage installation",
     "Night setup without disrupting shoppers"
    ]
   },
   {
    "name": "Seasonal Store Décor",
    "for": "Ramadan, Eid, National Day, back to school & festive seasons",
    "featured": true,
    "includes": [
     "Seasonal theme concept for the whole store or mall",
     "Entrance, atrium & ceiling installations",
     "Lanterns, lights & hanging décor",
     "Photo spots for shoppers",
     "Window and display styling",
     "Install before season & removal after",
     "Mall and safety regulations followed"
    ]
   },
   {
    "name": "Mall Activation",
    "for": "Atrium events, store openings & brand launches",
    "featured": false,
    "includes": [
     "Atrium stage, sound, lighting & LED screen",
     "Fabricated booths & branded set",
     "Kids activities, performers & mascots",
     "MC, giveaways & competitions",
     "Hostesses, crowd control & staffing",
     "Mall permits & landlord coordination",
     "Photo, video & social media content"
    ]
   }
  ]
 },
 "proposal": {
  "label": "Surprise proposals",
  "list": [
   {
    "name": "Intimate Proposal",
    "for": "At home, hotel room or private terrace",
    "featured": false,
    "includes": [
     "Rose petal path & candle setup",
     "\"Will you marry me?\" light-up letters or neon sign",
     "Heart balloon or floral arch",
     "Romantic table for two",
     "Secret setup coordinated with you",
     "Teardown after the moment"
    ]
   },
   {
    "name": "Signature Proposal",
    "for": "Beach, rooftop, garden or restaurant",
    "featured": true,
    "includes": [
     "Everything in Intimate",
     "Venue sourcing & booking",
     "Floral ring backdrop or flower wall",
     "Hidden photographer & videographer",
     "Live violinist or musician",
     "Dinner, cake & mocktail toast",
     "Coordinator to manage the surprise timing"
    ]
   },
   {
    "name": "Luxury Proposal",
    "for": "Yacht, desert camp or private island",
    "featured": false,
    "includes": [
     "Everything in Signature",
     "Private yacht or desert setup",
     "Fireworks or cold-pyro moment",
     "Drone video capture",
     "Celebration party for family & friends after",
     "Engagement styling & guest décor"
    ]
   }
  ]
 },
 "birthday": {
  "label": "Birthday setups",
  "list": [
   {
    "name": "Home Birthday",
    "for": "Birthday surprise or party at home, up to 50 guests",
    "featured": true,
    "includes": [
     "Theme concept & colour palette",
     "Balloon garland & name or age balloons",
     "Personalised backdrop",
     "Cake & dessert table styling",
     "Table styling",
     "Setup before guests arrive & teardown after"
    ]
   },
   {
    "name": "Office Birthday",
    "for": "Colleague surprise or monthly team birthdays",
    "featured": false,
    "includes": [
     "Desk, pantry or meeting room décor",
     "Balloon arch & banner with name",
     "Cake & snacks table",
     "Branded or themed backdrop for photos",
     "Quick setup outside working hours",
     "Building and office rules followed"
    ]
   },
   {
    "name": "Kids Party",
    "for": "Kids birthday at home, garden or venue",
    "featured": false,
    "includes": [
     "Everything in Home Birthday",
     "Kids entertainer, magician or mascot",
     "Face painting & games host",
     "Bouncy castle on request",
     "Themed cake & goodie bags",
     "Photography"
    ]
   }
  ]
 },
 "baby": {
  "label": "Baby shower & welcome baby",
  "list": [
   {
    "name": "Hospital Welcome",
    "for": "Welcome baby setup in the hospital room",
    "featured": false,
    "includes": [
     "Room décor in your chosen colours",
     "Balloon garland & name balloons",
     "Welcome baby backdrop or door sign",
     "Floral arrangement",
     "Sweets & chocolate table for visitors",
     "Ready before mum and baby return to the room",
     "Hospital decoration rules followed"
    ]
   },
   {
    "name": "Home Welcome",
    "for": "Welcome baby home party, up to 50 guests",
    "featured": true,
    "includes": [
     "Entrance & living room décor",
     "Balloon arch & personalised backdrop",
     "Cake & dessert table styling",
     "Mubarakiya favours for guests",
     "Floral arrangements",
     "Photography",
     "Setup & teardown"
    ]
   },
   {
    "name": "Baby Shower",
    "for": "Baby shower or gender reveal, at home or a venue",
    "featured": false,
    "includes": [
     "Theme concept & colour palette",
     "Backdrop, balloons & florals",
     "Gender reveal moment (smoke, balloon box or cake)",
     "Catering & themed cake",
     "Games host & activities",
     "Favours & photo corner",
     "On-site coordinator"
    ]
   }
  ]
 },
 "wedding": {
  "label": "Weddings & henna",
  "list": [
   {
    "name": "Intimate",
    "for": "Nikah, henna or small weddings",
    "featured": false,
    "includes": [
     "Concept & theme design",
     "Majlis or stage setup",
     "Floral arrangements",
     "Hospitality staff",
     "Photography"
    ]
   },
   {
    "name": "Signature Wedding",
    "for": "Weddings of 100 – 300 guests",
    "featured": true,
    "includes": [
     "Everything in Intimate",
     "Venue sourcing",
     "Kosha & ballroom design",
     "Catering & wedding cake",
     "Live music or DJ",
     "Photo & cinematic film",
     "Day-of coordination team"
    ]
   },
   {
    "name": "Royal",
    "for": "300+ guests or destination",
    "featured": false,
    "includes": [
     "Everything in Signature",
     "Guest list & RSVP",
     "Hotel & travel for guests",
     "LED, lighting & special effects",
     "Celebrity entertainment",
     "Planner from day one"
    ]
   }
  ]
 },
 "corporate": {
  "label": "Corporate & public",
  "list": [
   {
    "name": "Meeting",
    "for": "Seminars & workshops up to 100",
    "featured": false,
    "includes": [
     "Venue sourcing",
     "AV & sound",
     "Registration & hostesses",
     "Catering & coffee breaks",
     "Branded backdrop"
    ]
   },
   {
    "name": "Launch",
    "for": "Launches, galas & awards",
    "featured": true,
    "includes": [
     "Everything in Meeting",
     "Stage, LED & lighting",
     "MC & entertainment",
     "Fabrication & set build",
     "Photo, video & content",
     "Guest list management"
    ]
   },
   {
    "name": "Production",
    "for": "Conferences, exhibitions & festivals",
    "featured": false,
    "includes": [
     "Everything in Launch",
     "Exhibition stand building",
     "Live streaming & event tech",
     "Permits & logistics",
     "Event marketing & PR",
     "Post-event ROI report"
    ]
   }
  ]
 }
};
export const GROUP_ORDER: GroupKey[] = ["wedding","proposal","birthday","baby","social","opening","retail","nationalday","flagday","corporate"];
export const VENUE_TYPES: VenueType[] = [
 {
  "name": "Hotel ballrooms",
  "capacity": "Up to 2,500 guests",
  "goodFor": "Weddings, galas, conferences, award nights"
 },
 {
  "name": "Meeting & conference rooms",
  "capacity": "10 – 400 guests",
  "goodFor": "Seminars, board meetings, trainings, launches"
 },
 {
  "name": "Beach & outdoor",
  "capacity": "20 – 1,000 guests",
  "goodFor": "Proposals, weddings, festivals, family days"
 },
 {
  "name": "Rooftops & terraces",
  "capacity": "10 – 300 guests",
  "goodFor": "Proposals, birthdays, cocktail evenings"
 },
 {
  "name": "Restaurants & lounges",
  "capacity": "10 – 200 guests",
  "goodFor": "Private dining, birthdays, team dinners"
 },
 {
  "name": "Villas & homes",
  "capacity": "5 – 150 guests",
  "goodFor": "Birthdays, baby showers, henna nights"
 },
 {
  "name": "Yachts",
  "capacity": "2 – 150 guests",
  "goodFor": "Proposals, birthdays, corporate cruises"
 },
 {
  "name": "Desert camps",
  "capacity": "20 – 1,500 guests",
  "goodFor": "Gala dinners, National Day, incentives"
 }
];
export const SETUP_STYLES: SetupStyle[] = [
 {
  "name": "Theatre",
  "capacity": 500,
  "kind": "rows"
 },
 {
  "name": "Classroom",
  "capacity": 280,
  "kind": "class"
 },
 {
  "name": "U-shape",
  "capacity": 80,
  "kind": "u"
 },
 {
  "name": "Banquet",
  "capacity": 400,
  "kind": "round"
 },
 {
  "name": "Cabaret",
  "capacity": 300,
  "kind": "cab"
 },
 {
  "name": "Cocktail",
  "capacity": 700,
  "kind": "cock"
 }
];
export const ALL_SERVICES: string[] = CATEGORIES.flatMap(c => c.services.map(s => s.name));
export const SERVICE_COUNT = ALL_SERVICES.length;
export const PACKAGE_COUNT = Object.values(PACKAGES).reduce((a, g) => a + g.list.length, 0);
export const occasionGroup = (name: string): GroupKey => (OCCASIONS.find(o => o.name === name) ?? OCCASIONS[OCCASIONS.length - 1]).group;
