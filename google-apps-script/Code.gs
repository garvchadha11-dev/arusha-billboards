/**
 * Arusha Billboards - lead logger.
 * Receives POSTs from the website and appends one row per lead
 * to the Google Sheet this script is bound to.
 */
// The spreadsheet everything writes to - works from any script project,
// bound or standalone (no reliance on getActiveSpreadsheet).
const SHEET_ID = "1aUySSbT2qSxREVEpY3UzC_TX4sRjeDlWdA1wy1CtWGU";
function targetSpreadsheet() {
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet();
    if (s) return s;
  } catch (e) {}
  return SpreadsheetApp.openById(SHEET_ID);
}

const SHEET_NAME = "Leads";
const HEADERS = ["Timestamp", "Type", "Name", "Business", "Locations", "Duration", "Promoting", "Headline", "Page", "Device"];

// Remote maintenance triggers (no menu needed):
//   <web app url>?action=setup    -> creates Bookings + Calendar tabs
//   <web app url>?action=refresh  -> rebuilds the Calendar grid
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === "setup") { setupBookingSheets(); return ContentService.createTextOutput("setup done"); }
  if (action === "refresh") { refreshCalendar(); return ContentService.createTextOutput("calendar refreshed"); }
  return ContentService.createTextOutput("Vyoma Billboards API is running");
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = targetSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      data.type || "",
      data.name || "",
      data.business || "",
      data.locations || "",
      data.duration || "",
      data.promoting || "",
      data.headline || "",
      data.page || "",
      shortDevice(data.ua || "")
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  }
}

// Collapse the user-agent string to something readable
function shortDevice(ua) {
  if (/iPhone|iPad/i.test(ua)) return "iPhone/iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return ua.slice(0, 40);
}

// ====================================================================
// BOOKING CALENDAR
// "Bookings" tab = one row per rental (dropdowns for face + status).
// "Calendar" tab = auto-built availability grid: 12 faces x 18 months,
// green = confirmed, yellow = pencil, red = double-booked.
// First time: menu Billboards -> Set Up Booking Sheets.
// ====================================================================

const FACES = [
  "Kijenge Roundabout - Unit 1",
  "Kijenge Roundabout - Unit 2",
  "Matunda - Front",
  "Matunda - Back",
  "Car Showroom - Unit 1",
  "Car Showroom - Unit 2",
  "Summit Centre - Front",
  "Summit Centre - Back",
  "Tengeru - Front",
  "Tengeru - Back",
  "Total Njiro - Front",
  "Total Njiro - Back"
];
const BOOKING_HEADERS = ["Face", "Client", "Phone", "Start Date", "End Date", "Monthly Rate (TZS)", "Status", "Notes"];
const STATUSES = ["Confirmed", "Pencil", "Ended", "Cancelled"];
const CAL_MONTHS = 18;

const COLOR = {
  Confirmed: "#b7e1cd", // green
  Pencil:    "#fce8b2", // yellow
  CONFLICT:  "#ea9999", // red
  free:      "#ffffff",
  faceCol:   "#f3f0e8"
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Billboards")
    .addItem("Refresh Calendar", "refreshCalendar")
    .addItem("Set Up Booking Sheets", "setupBookingSheets")
    .addToUi();
}

function setupBookingSheets() {
  const ss = targetSpreadsheet();
  let b = ss.getSheetByName("Bookings");
  if (!b) {
    b = ss.insertSheet("Bookings");
    b.appendRow(BOOKING_HEADERS);
    b.getRange(1, 1, 1, BOOKING_HEADERS.length).setFontWeight("bold").setBackground("#101418").setFontColor("#e8b117");
    b.setFrozenRows(1);
    b.setColumnWidth(1, 220);
    b.setColumnWidth(8, 260);
    // dropdowns + date validation for the first 500 rows
    b.getRange(2, 1, 500, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(FACES, true).setAllowInvalid(false).build());
    b.getRange(2, 7, 500, 1).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
    b.getRange(2, 4, 500, 2).setDataValidation(
      SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
    b.getRange(2, 4, 500, 2).setNumberFormat("dd mmm yyyy");
    b.getRange(2, 6, 500, 1).setNumberFormat("#,##0");
  }
  refreshCalendar();
  targetSpreadsheet().toast("Booking sheets ready. Add rentals in the Bookings tab.", "Billboards");
}

// Rebuild the Calendar grid from the Bookings tab
function refreshCalendar() {
  const ss = targetSpreadsheet();
  const b = ss.getSheetByName("Bookings");
  if (!b) return;
  let cal = ss.getSheetByName("Calendar");
  if (!cal) cal = ss.insertSheet("Calendar");

  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const months = []; // first of each month, starting last month
  for (let i = -1; i < CAL_MONTHS - 1; i++) {
    months.push(new Date(now.getFullYear(), now.getMonth() + i, 1));
  }

  // face -> month index -> [{client, status}]
  const grid = {};
  FACES.forEach(f => grid[f] = months.map(() => []));

  const rows = b.getLastRow() > 1 ? b.getRange(2, 1, b.getLastRow() - 1, BOOKING_HEADERS.length).getValues() : [];
  rows.forEach(r => {
    const [face, client, , start, end, , status] = r;
    if (!face || !client || !(start instanceof Date)) return;
    if (status === "Cancelled") return;
    const endD = end instanceof Date ? end : start;
    months.forEach((m, i) => {
      const mEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      if (start <= mEnd && endD >= m) grid[face][i].push({ client, status: status || "Pencil" });
    });
  });

  // build value + background matrices
  const header = ["Face / Month"].concat(months.map(m => Utilities.formatDate(m, tz, "MMM yyyy")));
  const values = [header];
  const bgs = [header.map(() => "#101418")];
  FACES.forEach(f => {
    const row = [f], bg = [COLOR.faceCol];
    grid[f].forEach(cell => {
      const active = cell.filter(c => c.status !== "Ended");
      if (active.length > 1) {
        row.push("CONFLICT: " + active.map(c => c.client).join(" / "));
        bg.push(COLOR.CONFLICT);
      } else if (active.length === 1) {
        row.push(active[0].client);
        bg.push(COLOR[active[0].status] || COLOR.Pencil);
      } else if (cell.length) {          // only ended bookings
        row.push(cell[0].client + " (ended)");
        bg.push("#e8e6e1");
      } else {
        row.push("");
        bg.push(COLOR.free);
      }
    });
    values.push(row);
    bgs.push(bg);
  });

  cal.clear();
  cal.getRange(1, 1, values.length, header.length).setValues(values).setBackgrounds(bgs);
  cal.getRange(1, 1, 1, header.length).setFontWeight("bold").setFontColor("#e8b117");
  cal.getRange(2, 1, FACES.length, 1).setFontWeight("bold");
  cal.setFrozenRows(1);
  cal.setFrozenColumns(1);
  cal.setColumnWidth(1, 210);
  for (let c = 2; c <= header.length; c++) cal.setColumnWidth(c, 110);
  cal.getRange(1, 1, values.length, header.length).setBorder(true, true, true, true, true, true, "#d5d0c4", SpreadsheetApp.BorderStyle.SOLID);
}

// Any edit on the Bookings tab rebuilds the calendar
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === "Bookings") refreshCalendar();
}
