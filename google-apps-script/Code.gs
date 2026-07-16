/**
 * Arusha Billboards - lead logger.
 * Receives POSTs from the website and appends one row per lead
 * to the Google Sheet this script is bound to.
 */
const SHEET_NAME = "Leads";
const HEADERS = ["Timestamp", "Type", "Name", "Business", "Locations", "Duration", "Promoting", "Headline", "Page", "Device"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
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
