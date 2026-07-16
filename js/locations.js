// ============================================================
// BILLBOARD LOCATION DATA - edit this file to update the site.
// Coordinates are APPROXIMATE - drag-check each pin on
// https://www.openstreetmap.org and paste exact lat/lng here.
// Photos: put files in images/ and set the "photo" field,
// e.g. photo: "images/kijenge-1.jpg". Leave null for placeholder.
// Sizes: set real dimensions in metres when measured.
// "mockups": real photos with green-screen quads for the mockup studio.
// Each entry: {src, label, quads} where quads is a list of 4-corner
// polygons [TL,TR,BR,BL] in normalized 0-1 image coordinates
// (auto-detected from the green screens - regenerate with the
// detection script if photos change).
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
    photo: "images/roundabout-card.jpg",
    mockups: [
      { src: "images/roundabout.jpg", label: "View A", quads: [
        [[0.1028,0.1174],[0.3333,0.2535],[0.334,0.5098],[0.1018,0.4756]],
        [[0.3395,0.2707],[0.4719,0.334],[0.4723,0.524],[0.339,0.5173]]
      ]},
      { src: "images/roundabout-2.jpg", label: "View B", quads: [
        [[0.4855,0.4363],[0.636,0.3975],[0.6361,0.6224],[0.4856,0.6231]],
        [[0.638,0.3978],[0.8181,0.3249],[0.819,0.6224],[0.6377,0.6224]]
      ]}
    ],
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
    width_m: 12,
    height_m: 5,
    photo: "images/matunda-card.jpg",
    mockups: [
      { src: "images/matunda.jpg", label: "Front", quads: [
        [[0.293,0.1646],[0.6279,0.1787],[0.6253,0.4236],[0.2896,0.4087]]
      ]},
      { src: "images/matunda-back.jpg", label: "Back", quads: [
        [[0.3367,0.212],[0.6574,0.215],[0.657,0.4487],[0.3355,0.4443]]
      ]}
    ],
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
    width_m: 12,
    height_m: 5,
    photo: "images/summit-card.jpg",
    mockups: [
      { src: "images/summit.jpg", label: "Front", quads: [
        [[0.0976,0.2557],[0.4208,0.284],[0.4153,0.4976],[0.0909,0.4693]]
      ]},
      { src: "images/summit-back.jpg", label: "Back", quads: [
        [[0.4622,0.1297],[0.827,0.1327],[0.8266,0.4444],[0.4609,0.4399]]
      ]}
    ],
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
    width_m: 12,
    height_m: 5,
    photo: "images/total-card.jpg",
    mockups: [
      { src: "images/total.jpg", label: "Front", quads: [
        [[0.3213,0.2683],[0.602,0.2579],[0.6054,0.4672],[0.3226,0.4769]]
      ]},
      { src: "images/total-back.jpg", label: "Back", quads: [
        [[0.2359,0.2661],[0.5237,0.2795],[0.5212,0.4821],[0.2325,0.4679]]
      ]}
    ],
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

// Google Sheet lead logging. Paste your Apps Script Web App URL here
// (setup steps in google-apps-script/README.md). Empty = logging off.
const LEADS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwrgm9eBb8dhjJb43CZr_OQ42dcONYQj_Um_qw95PkI0964uwAnkLaxF5gFsFExEO_M/exec";
