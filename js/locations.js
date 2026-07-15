// ============================================================
// BILLBOARD LOCATION DATA - edit this file to update the site.
// Coordinates are APPROXIMATE - drag-check each pin on
// https://www.openstreetmap.org and paste exact lat/lng here.
// Photos: put files in images/ and set the "photo" field,
// e.g. photo: "images/kijenge-1.jpg". Leave null for placeholder.
// Sizes: set real dimensions in metres when measured.
// ============================================================

const LOCATIONS = [
  {
    id: "kijenge",
    name: "Kijenge Roundabout",
    units: 2,
    type: "2 static units",
    crossover: false,
    lat: -3.3770,   // old Impala Hotel roundabout, near Amber Restaurant (OSM geocoded landmarks)
    lng: 36.7035,
    width_m: null,   // e.g. 12
    height_m: null,  // e.g. 6
    photo: null,
    blurb: "High-traffic roundabout on the Old Moshi Road corridor. Constant flow of commuter, safari and school traffic from morning to late evening.",
    audience: "Commuters, tourists heading to Moshi/KIA, residents of Kijenge and Themi Hill."
  },
  {
    id: "matunda",
    name: "Matunda - Outside Spanish Tiles Showroom",
    units: 1,
    type: "Front + back, crossover billboard",
    crossover: true,
    lat: -3.40305,  // WRONG - this is the Excel West Rd showroom; Matunda showroom not in OSM. Drag in ?edit mode.
    lng: 36.71316,
    width_m: null,
    height_m: null,
    photo: null,
    blurb: "Double-sided crossover unit facing traffic in both directions outside the Spanish Tiles showroom. Two exposures from one placement.",
    audience: "Retail shoppers, contractors, homeowners, daily through-traffic."
  },
  {
    id: "carshowroom",
    name: "Car Showroom - After Kibo Palace",
    units: 2,
    type: "2 static units",
    crossover: false,
    lat: -3.3754,   // Kibo Palace Hotel, Ingira Street (OSM geocoded) - nudge to showroom in ?edit mode
    lng: 36.6986,
    width_m: null,
    height_m: null,
    photo: null,
    blurb: "Two units on the busy stretch past Kibo Palace Hotel, in front of the car showroom. Slow-moving traffic means long dwell time on your message.",
    audience: "Business travellers, hotel guests, car buyers, city-centre traffic."
  },
  {
    id: "summit",
    name: "Summit Centre (Shoppers)",
    units: 1,
    type: "Front + back, crossover billboard",
    crossover: true,
    lat: -3.3755,   // TFA complex / Shoppers, Sokoine Road (OSM geocoded)
    lng: 36.6789,
    width_m: null,
    height_m: null,
    photo: null,
    blurb: "Crossover billboard at Summit Centre in the TFA complex, home of Shoppers Supermarket. Captures shoppers arriving and leaving, plus busy Sokoine Road traffic.",
    audience: "Middle and upper-income shoppers, families, city-centre traffic."
  },
  {
    id: "tengeru",
    name: "Tengeru",
    units: 1,
    type: "Front + back",
    crossover: false,
    lat: -3.3733,   // Tengeru on Arusha-Moshi highway (OSM geocoded)
    lng: 36.7860,
    width_m: null,
    height_m: null,
    photo: null,
    blurb: "Double-sided unit on the Arusha-Moshi highway at Tengeru. Every vehicle between Arusha, the airport and Moshi passes this board.",
    audience: "Intercity traffic, tourists to/from Kilimanjaro Airport, Tengeru market crowds."
  },
  {
    id: "total-njiro",
    name: "Total Petrol Station (Njiro)",
    units: 1,
    type: "Front + back, crossover billboard",
    crossover: true,
    lat: -3.3905,   // APPROXIMATE - station is left of RSA Limited, Njiro; RSA not in OSM, drag in ?edit mode
    lng: 36.7046,
    width_m: null,
    height_m: null,
    photo: null,
    blurb: "Crossover billboard at the Total petrol station on Njiro Road. Drivers stopped to refuel get extended exposure to your brand.",
    audience: "Motorists, boda riders, Njiro's fast-growing residential population."
  }
];

// Contact details - edit here, used everywhere on the site.
const CONTACT = {
  phone1: "0685 333 666",
  phone1_tel: "+255685333666",
  phone2: "0748 444 441",
  phone2_tel: "+255748444441",
  whatsapp: "255685333666", // digits only, international format, no +
  email: "" // add when ready, e.g. billboards@spanishtiles.co.tz
};
