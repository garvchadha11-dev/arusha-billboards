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
// ---------- Enquiry modal ----------
const modal = document.getElementById("enquiryModal");
const eqLocsBox = document.getElementById("eqLocs");
LOCATIONS.forEach(loc => {
  const lbl = document.createElement("label");
  lbl.innerHTML = `<input type="checkbox" value="${loc.name}" data-loc="${loc.id}"> ${loc.name.split(" - ")[0]}`;
  eqLocsBox.appendChild(lbl);
});

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
  const name = document.getElementById("eqName").value.trim();
  const biz = document.getElementById("eqBiz").value.trim();
  const locs = [...eqLocsBox.querySelectorAll("input:checked")].map(cb => cb.value);
  const dur = document.getElementById("eqDuration").value;
  const goal = document.getElementById("eqGoal").value.trim();

  let msg = "Hello! Billboard enquiry from your website.";
  if (name) msg += "\nName: " + name;
  if (biz) msg += "\nBusiness: " + biz;
  msg += "\nLocations: " + (locs.length ? locs.join(", ") : "Open to recommendations");
  msg += "\nDuration: " + dur;
  if (goal) msg += "\nPromoting: " + goal;
  msg += "\n\nPlease share availability and rates.";

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

  const photoStyle = loc.photo ? ` style="background-image:url('${loc.photo}')"` : "";
  const placeholder = loc.photo ? "" :
    `<div class="ph"><b>${loc.units * (loc.type.includes("Front") ? 2 : 1)}</b>face${loc.units * (loc.type.includes("Front") ? 2 : 1) > 1 ? "s" : ""} · photo coming soon</div>`;

  card.innerHTML = `
    <div class="loc-photo"${photoStyle}>
      ${placeholder}
      ${loc.crossover ? '<span class="badge">Crossover</span>' : ""}
    </div>
    <div class="loc-body">
      <h3>${loc.name}</h3>
      <div class="loc-type">${loc.type} · ${sizeTxt}</div>
      <p>${loc.blurb}</p>
      <div class="loc-aud"><b>Who sees it:</b> ${loc.audience}</div>
      <div class="loc-actions">
        <button class="btn small" onclick="openEnquiry('${loc.id}')">Enquire</button>
        <button class="btn small dark" onclick="previewLocation('${loc.id}')">Preview My Ad</button>
      </div>
    </div>`;
  grid.appendChild(card);
});

// ---------- Map ----------
const map = L.map("map", { scrollWheelZoom: false });
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

// Pin-placement edit mode: open index.html?edit, drag pins to the exact
// spots, then copy the corrected lines from the panel into js/locations.js.
const EDIT_MODE = new URLSearchParams(location.search).has("edit");

const bounds = [];
const markers = {};
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

function updateEditPanel() {
  const lines = LOCATIONS.map(loc => {
    const p = markers[loc.id].getLatLng();
    return `${loc.id}:  lat: ${p.lat.toFixed(6)},  lng: ${p.lng.toFixed(6)},`;
  }).join("\n");
  document.getElementById("editCoords").textContent = lines;
}

if (EDIT_MODE) {
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

function drawMockup() {
  const loc = currentLoc();
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

dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => loadFile(fileInput.files[0]));
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("over"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("over");
  loadFile(e.dataTransfer.files[0]);
});
locSelect.addEventListener("change", drawMockup);
headlineInput.addEventListener("input", drawMockup);

document.getElementById("downloadBtn").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "billboard-mockup-" + currentLoc().id + ".png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

const waSend = document.getElementById("waSendBtn");
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
  drawMockup();
  refreshWaSend();
  document.getElementById("studio").scrollIntoView({ behavior: "smooth" });
}

drawMockup();
