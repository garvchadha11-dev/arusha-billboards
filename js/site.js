/* Renders location cards, the map, and the mockup studio.
   All data lives in js/locations.js - edit that file, not this one. */

// ---------- Contact wiring ----------
document.getElementById("year").textContent = new Date().getFullYear();
const p1 = document.getElementById("phone1Link");
p1.textContent = CONTACT.phone1;
p1.href = "tel:" + CONTACT.phone1_tel;
const p2 = document.getElementById("phone2Link");
p2.textContent = CONTACT.phone2;
p2.href = "tel:" + CONTACT.phone2_tel;

function waLink(text) {
  return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text);
}

// Fire-and-forget lead logging to the Google Sheet (see google-apps-script/).
// Never blocks or breaks the WhatsApp handoff: no-cors + keepalive, errors swallowed.
function logLead(data) {
  if (!LEADS_ENDPOINT) return;
  try {
    fetch(LEADS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" }, // text/plain avoids CORS preflight
      body: JSON.stringify({ ...data, page: location.href, ua: navigator.userAgent })
    }).catch(() => {});
  } catch (e) { /* logging must never break the enquiry */ }
}
// ---------- Enquiry modal ----------
const modal = document.getElementById("enquiryModal");
const eqLocsBox = document.getElementById("eqLocs");
LOCATIONS.forEach(loc => {
  const lbl = document.createElement("label");
  lbl.innerHTML = `<input type="checkbox" value="${loc.name}" data-loc="${loc.id}"> ${loc.name.split(" - ")[0]}`;
  eqLocsBox.appendChild(lbl);
});

// Country codes for the phone field - Tanzania first, then the region and
// common international callers.
const COUNTRY_CODES = [
  ["🇹🇿 TZ +255", "255"], ["🇰🇪 KE +254", "254"], ["🇺🇬 UG +256", "256"],
  ["🇷🇼 RW +250", "250"], ["🇧🇮 BI +257", "257"], ["🇨🇩 CD +243", "243"],
  ["🇿🇲 ZM +260", "260"], ["🇲🇼 MW +265", "265"], ["🇲🇿 MZ +258", "258"],
  ["🇿🇦 ZA +27", "27"], ["🇮🇳 IN +91", "91"], ["🇦🇪 AE +971", "971"],
  ["🇴🇲 OM +968", "968"], ["🇸🇦 SA +966", "966"], ["🇶🇦 QA +974", "974"],
  ["🇬🇧 UK +44", "44"], ["🇺🇸 US +1", "1"], ["🇨🇳 CN +86", "86"],
  ["🇩🇪 DE +49", "49"], ["🇮🇹 IT +39", "39"], ["🇪🇸 ES +34", "34"]
];
const ccSelect = document.getElementById("eqCC");
COUNTRY_CODES.forEach(([label, code]) => {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = label;
  ccSelect.appendChild(opt);
});

// Build a clean international number: strip spaces/dashes and any leading 0
function fullPhone() {
  const raw = document.getElementById("eqPhone").value.replace(/\D/g, "").replace(/^0+/, "");
  return raw ? "+" + ccSelect.value + raw : "";
}

function openEnquiry(locId) {
  eqLocsBox.querySelectorAll("input").forEach(cb => { cb.checked = cb.dataset.loc === locId; });
  modal.classList.add("open");
}
function closeEnquiry() { modal.classList.remove("open"); }

document.getElementById("waFloat").addEventListener("click", e => { e.preventDefault(); openEnquiry(); });
// Main CTAs (nav "Book a Board", hero "Check Availability") open the form too
document.querySelectorAll('a.btn[href="#contact"]').forEach(a =>
  a.addEventListener("click", e => { e.preventDefault(); openEnquiry(); })
);
document.getElementById("modalClose").addEventListener("click", closeEnquiry);
modal.addEventListener("click", e => { if (e.target === modal) closeEnquiry(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeEnquiry(); });

document.getElementById("eqSend").addEventListener("click", () => {
  // honeypot: humans never see this field; bots that fill it get dropped
  if (document.getElementById("eqWebsite").value) { closeEnquiry(); return; }
  const name = document.getElementById("eqName").value.trim();
  const biz = document.getElementById("eqBiz").value.trim();
  const phone = fullPhone();
  const email = document.getElementById("eqEmail").value.trim();
  const locs = [...eqLocsBox.querySelectorAll("input:checked")].map(cb => cb.value);
  const dur = document.getElementById("eqDuration").value;
  const goal = document.getElementById("eqGoal").value.trim();

  let msg = "Hello! Billboard enquiry from your website.";
  if (name) msg += "\nName: " + name;
  if (biz) msg += "\nBusiness: " + biz;
  if (phone) msg += "\nPhone: " + phone;
  if (email) msg += "\nEmail: " + email;
  msg += "\nLocations: " + (locs.length ? locs.join(", ") : "Open to recommendations");
  msg += "\nDuration: " + dur;
  if (goal) msg += "\nPromoting: " + goal;
  msg += "\n\nPlease share availability and rates.";

  logLead({ type: "enquiry-form", name, phone, email, business: biz, locations: locs.join(", "), duration: dur, promoting: goal });
  window.open(waLink(msg), "_blank");
  closeEnquiry();
});

// ---------- Location cards ----------
const grid = document.getElementById("locGrid");
LOCATIONS.forEach(loc => {
  const sizeTxt = (loc.width_m && loc.height_m)
    ? `${loc.width_m}m × ${loc.height_m}m`
    : "Size on request";
  const card = document.createElement("div");
  card.className = "loc-card";
  card.id = "loc-" + loc.id;

  const photoEl = loc.photo
    ? `<img src="${loc.photo}" alt="${loc.name} billboard" loading="lazy" decoding="async">`
    : `<div class="ph"><b>${loc.units * (loc.type.includes("Front") ? 2 : 1)}</b>face${loc.units * (loc.type.includes("Front") ? 2 : 1) > 1 ? "s" : ""} · photo coming soon</div>`;

  card.innerHTML = `
    <div class="loc-photo">
      ${photoEl}
      ${loc.crossover ? '<span class="badge">Crossover</span>' : ""}
    </div>
    <div class="loc-body">
      <h3>${loc.name}</h3>
      <div class="loc-type">${loc.type} · ${sizeTxt}</div>
      <p>${loc.blurb}</p>
      <div class="loc-aud"><b>Who sees it:</b> ${loc.audience}</div>
      <div class="loc-actions">
        <button class="btn small" onclick="openEnquiry('${loc.id}')">Enquire</button>
        <button class="btn small dark" onclick="previewLocation('${loc.id}')">Preview My Billboard</button>
      </div>
    </div>`;
  grid.appendChild(card);
});

// ---------- Mobile: auto-sliding location carousel + dots ----------
const dotsBox = document.getElementById("locDots");
LOCATIONS.forEach((_, i) => {
  const d = document.createElement("span");
  if (i === 0) d.className = "on";
  dotsBox.appendChild(d);
});

const mobileMq = matchMedia("(max-width: 640px)");
let slideTimer = null;

function currentSlide() {
  const card = grid.querySelector(".loc-card");
  if (!card) return 0;
  const step = card.offsetWidth + 14;
  return Math.round(grid.scrollLeft / step);
}
function goToSlide(i) {
  const card = grid.querySelector(".loc-card");
  if (!card) return;
  grid.scrollTo({ left: i * (card.offsetWidth + 14), behavior: "smooth" });
}
function stopAutoSlide() {
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
}
function startAutoSlide() {
  if (slideTimer || !mobileMq.matches) return;
  slideTimer = setInterval(() => {
    goToSlide((currentSlide() + 1) % LOCATIONS.length);
  }, 3500);
}

// dots follow scroll position
let dotTick = null;
grid.addEventListener("scroll", () => {
  clearTimeout(dotTick);
  dotTick = setTimeout(() => {
    const i = currentSlide();
    dotsBox.querySelectorAll("span").forEach((d, j) => d.classList.toggle("on", j === i));
  }, 80);
}, { passive: true });

// user touch takes over - stop sliding for good
grid.addEventListener("pointerdown", stopAutoSlide, { passive: true });
grid.addEventListener("wheel", stopAutoSlide, { passive: true });

// only slide while the carousel is on screen
if ("IntersectionObserver" in window) {
  new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? startAutoSlide() : stopAutoSlide());
  }, { threshold: 0.3 }).observe(grid);
}
mobileMq.addEventListener("change", () => { stopAutoSlide(); });

// ---------- Mobile tab bar scrollspy ----------
const navTabs = document.querySelectorAll("#navTabs a");
if (navTabs.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navTabs.forEach(t => t.classList.toggle("active", t.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  ["map-section", "locations", "studio", "how", "contact"].forEach(id => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

// ---------- Map (init deferred until scrolled near, saves tile downloads) ----------
// Pin-placement edit mode: open index.html?edit, drag pins to the exact
// spots, then copy the corrected lines from the panel into js/locations.js.
const EDIT_MODE = new URLSearchParams(location.search).has("edit");

let map = null;
const markers = {};

function initMap() {
  if (map) return;
  map = L.map("map", { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;background:#e8b117;border:3px solid #101418;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,.35);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

  const bounds = [];
  LOCATIONS.forEach(loc => {
    bounds.push([loc.lat, loc.lng]);
    const m = L.marker([loc.lat, loc.lng], { icon: pinIcon, draggable: EDIT_MODE }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">${loc.name}</div>
      <div class="popup-meta">${loc.type}</div>
      <a class="popup-link" href="#loc-${loc.id}">View details ↓</a>
    `);
    markers[loc.id] = m;
    if (EDIT_MODE) m.on("dragend", updateEditPanel);
  });
  map.fitBounds(bounds, { padding: [40, 40] });
}

function updateEditPanel() {
  const lines = LOCATIONS.map(loc => {
    const p = markers[loc.id].getLatLng();
    return `${loc.id}:  lat: ${p.lat.toFixed(6)},  lng: ${p.lng.toFixed(6)},`;
  }).join("\n");
  document.getElementById("editCoords").textContent = lines;
}

if (EDIT_MODE) {
  initMap(); // edit mode needs the map immediately
  map.scrollWheelZoom.enable();
  const panel = document.createElement("div");
  panel.style.cssText = "margin-top:14px;background:#101418;color:#e8b117;border-radius:14px;padding:18px;font-family:monospace;font-size:13px;";
  panel.innerHTML = `
    <div style="color:#fff;font-family:inherit;font-weight:700;margin-bottom:8px;">
      EDIT MODE - drag each pin to the exact billboard spot, then copy these values into js/locations.js:
    </div>
    <pre id="editCoords" style="white-space:pre-wrap;margin:0 0 12px;"></pre>
    <button id="copyCoords" style="padding:8px 16px;border-radius:8px;border:none;background:#e8b117;font-weight:700;cursor:pointer;">Copy to clipboard</button>`;
  document.getElementById("map").after(panel);
  updateEditPanel();
  document.getElementById("copyCoords").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("editCoords").textContent);
    document.getElementById("copyCoords").textContent = "Copied!";
    setTimeout(() => document.getElementById("copyCoords").textContent = "Copy to clipboard", 1500);
  });
}

// ---------- Mockup studio ----------
const canvas = document.getElementById("mockupCanvas");
const ctx = canvas.getContext("2d");
const locSelect = document.getElementById("studioLoc");
const headlineInput = document.getElementById("studioHeadline");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

LOCATIONS.forEach(loc => {
  const opt = document.createElement("option");
  opt.value = loc.id;
  opt.textContent = loc.name;
  locSelect.appendChild(opt);
});

let artwork = null; // Image object

function currentLoc() {
  return LOCATIONS.find(l => l.id === locSelect.value) || LOCATIONS[0];
}

// ---- Real-photo mockups (green-screen quads) ----
const viewField = document.getElementById("viewField");
const viewSelect = document.getElementById("studioView");
const photoCache = {};

function getPhoto(src) {
  if (!photoCache[src]) {
    const img = new Image();
    img.onload = drawMockup;
    img.src = src;
    photoCache[src] = img;
  }
  return photoCache[src];
}

function refreshViewOptions() {
  const loc = currentLoc();
  viewSelect.innerHTML = "";
  if (loc.mockups && loc.mockups.length > 1) {
    loc.mockups.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = m.label;
      viewSelect.appendChild(opt);
    });
    viewField.style.display = "";
  } else {
    viewField.style.display = "none";
  }
}

// Compose the flat billboard face (artwork + headline) at the board's ratio
function composeFace(loc) {
  const ratio = (loc.width_m && loc.height_m) ? loc.width_m / loc.height_m : 2.4;
  const fw = 1200, fh = Math.round(1200 / ratio);
  const face = document.createElement("canvas");
  face.width = fw; face.height = fh;
  const fx = face.getContext("2d");

  if (artwork) {
    const s = Math.max(fw / artwork.width, fh / artwork.height);
    const dw = artwork.width * s, dh = artwork.height * s;
    fx.drawImage(artwork, (fw - dw) / 2, (fh - dh) / 2, dw, dh);
  } else {
    fx.fillStyle = "#f2efe8";
    fx.fillRect(0, 0, fw, fh);
    fx.fillStyle = "#b9b2a2";
    fx.font = `800 ${fh * 0.22}px "Helvetica Neue", Arial, sans-serif`;
    fx.textAlign = "center";
    fx.textBaseline = "middle";
    fx.fillText("YOUR AD HERE", fw / 2, fh / 2 - (headlineInput.value.trim() ? fh * 0.1 : 0));
  }

  const headline = headlineInput.value.trim();
  if (headline) {
    const bandH = fh * 0.24;
    fx.fillStyle = "rgba(16,20,24,0.82)";
    fx.fillRect(0, fh - bandH, fw, bandH);
    fx.fillStyle = "#e8b117";
    fx.textAlign = "center";
    fx.textBaseline = "middle";
    let fs = bandH * 0.5;
    fx.font = `800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    while (fx.measureText(headline.toUpperCase()).width > fw * 0.92 && fs > 10) {
      fs -= 2;
      fx.font = `800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    }
    fx.fillText(headline.toUpperCase(), fw / 2, fh - bandH / 2);
  }
  return face;
}

// Projective map: unit square -> quad [TL,TR,BR,BL] (pixel coords)
function homography(q) {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1[0] - p2[0], dx2 = p3[0] - p2[0];
  const dy1 = p1[1] - p2[1], dy2 = p3[1] - p2[1];
  const sx = p0[0] - p1[0] + p2[0] - p3[0];
  const sy = p0[1] - p1[1] + p2[1] - p3[1];
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  const a = p1[0] - p0[0] + g * p1[0], b = p3[0] - p0[0] + h * p3[0], c = p0[0];
  const d = p1[1] - p0[1] + g * p1[1], e = p3[1] - p0[1] + h * p3[1], f = p0[1];
  return (u, v) => {
    const w = g * u + h * v + 1;
    return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
  };
}

// Draw src canvas onto ctx warped into quad, via NxN grid of triangles
function drawWarped(ctx2, src, quad, N = 14) {
  const H = homography(quad);
  const sw = src.width / N, sh = src.height / N;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const u0 = i / N, v0 = j / N, u1 = (i + 1) / N, v1 = (j + 1) / N;
      const P00 = H(u0, v0), P10 = H(u1, v0), P11 = H(u1, v1), P01 = H(u0, v1);
      drawTri(ctx2, src, [i * sw, j * sh], [(i + 1) * sw, j * sh], [i * sw, (j + 1) * sh], P00, P10, P01);
      drawTri(ctx2, src, [(i + 1) * sw, j * sh], [(i + 1) * sw, (j + 1) * sh], [i * sw, (j + 1) * sh], P10, P11, P01);
    }
  }
}

// Affine-map one textured triangle (s0,s1,s2 in src) to (d0,d1,d2) on ctx
function drawTri(ctx2, src, s0, s1, s2, d0, d1, d2) {
  ctx2.save();
  // clip path expanded ~1px from centroid so adjacent triangles overlap (hides seams)
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
  ctx2.beginPath();
  [d0, d1, d2].forEach((p, i) => {
    const vx = p[0] - cx, vy = p[1] - cy;
    const L = Math.hypot(vx, vy) || 1;
    const ex = p[0] + vx / L * 1.2, ey = p[1] + vy / L * 1.2;
    i ? ctx2.lineTo(ex, ey) : ctx2.moveTo(ex, ey);
  });
  ctx2.closePath();
  ctx2.clip();
  const [sx0, sy0] = s0, [sx1, sy1] = s1, [sx2, sy2] = s2;
  const den = (sx1 - sx0) * (sy2 - sy0) - (sx2 - sx0) * (sy1 - sy0);
  const m11 = ((d1[0] - d0[0]) * (sy2 - sy0) - (d2[0] - d0[0]) * (sy1 - sy0)) / den;
  const m12 = ((d2[0] - d0[0]) * (sx1 - sx0) - (d1[0] - d0[0]) * (sx2 - sx0)) / den;
  const m21 = ((d1[1] - d0[1]) * (sy2 - sy0) - (d2[1] - d0[1]) * (sy1 - sy0)) / den;
  const m22 = ((d2[1] - d0[1]) * (sx1 - sx0) - (d1[1] - d0[1]) * (sx2 - sx0)) / den;
  ctx2.transform(m11, m21, m12, m22,
    d0[0] - m11 * sx0 - m12 * sy0,
    d0[1] - m21 * sx0 - m22 * sy0);
  ctx2.drawImage(src, 0, 0);
  ctx2.restore();
}

function drawMockup() {
  const loc = currentLoc();
  const views = loc.mockups;
  if (views && views.length) {
    const view = views[Math.min(viewSelect.value || 0, views.length - 1)];
    const photo = getPhoto(view.src);
    if (!photo.complete || !photo.naturalWidth) return; // redraws onload
    canvas.width = 1800;
    canvas.height = Math.round(1800 * photo.naturalHeight / photo.naturalWidth);
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
    const face = composeFace(loc);
    view.quads.forEach(q => {
      const quadPx = q.map(p => [p[0] * canvas.width, p[1] * canvas.height]);
      // stroke the quad in the face's edge tone to bury any green fringe
      ctx.strokeStyle = "rgba(40,44,48,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      quadPx.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      ctx.stroke();
      drawWarped(ctx, face, quadPx);
    });
    drawCaption(loc);
    return;
  }
  drawIllustration(loc); // no site photo yet - drawn scene fallback
}

function drawCaption(loc) {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = "rgba(16,20,24,0.75)";
  ctx.textAlign = "left";
  const cap = loc.name + "  ·  " + loc.type;
  ctx.font = `700 ${W * 0.016}px "Helvetica Neue", Arial, sans-serif`;
  const capW = ctx.measureText(cap).width + 36;
  roundRect(ctx, 20, H - 58, capW, 38, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(cap, 38, H - 39);
}

function drawIllustration(loc) {
  canvas.width = 1200;
  canvas.height = 900;
  const W = canvas.width, H = canvas.height;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
  sky.addColorStop(0, "#7db3d8");
  sky.addColorStop(1, "#cfe3ef");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.72, 0, H);
  ground.addColorStop(0, "#8a9a6b");
  ground.addColorStop(1, "#6d7d54");
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // Road strip
  ctx.fillStyle = "#5a5f66";
  ctx.fillRect(0, H * 0.86, W, H * 0.14);
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 4;
  ctx.setLineDash([40, 30]);
  ctx.beginPath();
  ctx.moveTo(0, H * 0.93);
  ctx.lineTo(W, H * 0.93);
  ctx.stroke();
  ctx.setLineDash([]);

  // Billboard face geometry (default 2:1 if size unknown)
  const ratio = (loc.width_m && loc.height_m) ? loc.width_m / loc.height_m : 2;
  const faceW = W * 0.68;
  const faceH = Math.min(faceW / ratio, H * 0.42);
  const faceX = (W - faceW) / 2;
  const faceY = H * 0.10;

  // Poles
  ctx.fillStyle = "#4a4f55";
  const poleW = W * 0.02;
  ctx.fillRect(W / 2 - poleW / 2, faceY + faceH, poleW, H * 0.72 - (faceY + faceH) + H * 0.06);

  // Frame
  const pad = 14;
  ctx.fillStyle = "#22272d";
  roundRect(ctx, faceX - pad, faceY - pad, faceW + pad * 2, faceH + pad * 2, 10);
  ctx.fill();

  // Face
  ctx.save();
  roundRect(ctx, faceX, faceY, faceW, faceH, 4);
  ctx.clip();

  if (artwork) {
    // cover-fit
    const s = Math.max(faceW / artwork.width, faceH / artwork.height);
    const dw = artwork.width * s, dh = artwork.height * s;
    ctx.drawImage(artwork, faceX + (faceW - dw) / 2, faceY + (faceH - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#f2efe8";
    ctx.fillRect(faceX, faceY, faceW, faceH);
    ctx.fillStyle = "#b9b2a2";
    ctx.font = `800 ${faceH * 0.22}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOUR AD HERE", faceX + faceW / 2, faceY + faceH / 2 - (headlineInput.value ? faceH * 0.08 : 0));
  }

  // Headline band
  const headline = headlineInput.value.trim();
  if (headline) {
    const bandH = faceH * 0.24;
    ctx.fillStyle = "rgba(16,20,24,0.82)";
    ctx.fillRect(faceX, faceY + faceH - bandH, faceW, bandH);
    ctx.fillStyle = "#e8b117";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let fs = bandH * 0.5;
    ctx.font = `800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    while (ctx.measureText(headline.toUpperCase()).width > faceW * 0.92 && fs > 10) {
      fs -= 2;
      ctx.font = `800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    }
    ctx.fillText(headline.toUpperCase(), faceX + faceW / 2, faceY + faceH - bandH / 2);
  }
  ctx.restore();

  // Subtle face gloss
  const gloss = ctx.createLinearGradient(faceX, faceY, faceX + faceW, faceY + faceH);
  gloss.addColorStop(0, "rgba(255,255,255,0.10)");
  gloss.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  roundRect(ctx, faceX, faceY, faceW, faceH, 4);
  ctx.fill();

  // Location caption
  ctx.fillStyle = "rgba(16,20,24,0.75)";
  ctx.textAlign = "left";
  const cap = loc.name + "  ·  " + loc.type;
  ctx.font = `700 ${W * 0.016}px "Helvetica Neue", Arial, sans-serif`;
  const capW = ctx.measureText(cap).width + 36;
  roundRect(ctx, 20, H - 58, capW, 38, 8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(cap, 38, H - 39);
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => { artwork = img; drawMockup(); };
  img.src = URL.createObjectURL(file);
}

dropZone.addEventListener("click", e => {
  if (e.target !== fileInput) fileInput.click(); // input is inside the zone; its click bubbles back here
});
fileInput.addEventListener("change", () => loadFile(fileInput.files[0]));
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("over"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("over");
  loadFile(e.dataTransfer.files[0]);
});
locSelect.addEventListener("change", () => { refreshViewOptions(); drawMockup(); setActiveChip(); });
viewSelect.addEventListener("change", drawMockup);
headlineInput.addEventListener("input", drawMockup);

// Quick-switch chips: preview the same artwork across all boards
const chipRow = document.getElementById("locChips");
LOCATIONS.forEach(loc => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.dataset.loc = loc.id;
  chip.textContent = loc.name.split(" - ")[0].split(" (")[0];
  chip.addEventListener("click", () => {
    locSelect.value = loc.id;
    refreshViewOptions();
    drawMockup();
    refreshWaSend();
    setActiveChip();
  });
  chipRow.appendChild(chip);
});
function setActiveChip() {
  chipRow.querySelectorAll(".chip").forEach(c =>
    c.classList.toggle("active", c.dataset.loc === locSelect.value));
}

// Fullscreen viewer
const fsOverlay = document.getElementById("fsOverlay");
const fsImg = document.getElementById("fsImg");
document.getElementById("fullscreenBtn").addEventListener("click", () => {
  fsImg.src = canvas.toDataURL("image/jpeg", 0.92);
  fsOverlay.classList.add("open");
});
function closeFs() { fsOverlay.classList.remove("open"); }
fsOverlay.addEventListener("click", closeFs);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeFs(); });

document.getElementById("downloadBtn").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "billboard-mockup-" + currentLoc().id + ".png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

const waSend = document.getElementById("waSendBtn");
waSend.addEventListener("click", () => {
  logLead({ type: "mockup-send", locations: currentLoc().name, headline: headlineInput.value.trim() });
});
function refreshWaSend() {
  waSend.href = waLink(
    "Hello! I made a billboard mockup for " + currentLoc().name +
    " on your website. Sending it here - can you share availability and rates?"
  );
}
locSelect.addEventListener("change", refreshWaSend);
refreshWaSend();

// Called from location card buttons
function previewLocation(id) {
  locSelect.value = id;
  refreshViewOptions();
  drawMockup();
  refreshWaSend();
  setActiveChip();
  document.getElementById("studio").scrollIntoView({ behavior: "smooth" });
}

refreshViewOptions();
setActiveChip();

// Defer heavy work (map tiles, studio photo) until scrolled near.
if ("IntersectionObserver" in window && !EDIT_MODE) {
  const lazyInit = (el, fn) => {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { rootMargin: "600px" });
    io.observe(el);
  };
  lazyInit(document.getElementById("map"), initMap);
  lazyInit(document.getElementById("studio"), drawMockup);
} else {
  if (!EDIT_MODE) initMap();
  drawMockup();
}
