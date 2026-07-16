# Lead logging to Google Sheets - one-time setup (~5 min)

Every "Send on WhatsApp" click on the site (enquiry form + mockup studio) gets
logged as a row in your Google Sheet: timestamp, name, business, locations,
duration, what they're promoting, device.

## Setup

1. Create a new Google Sheet (sheets.new), name it e.g. "Billboard Leads".
2. In the Sheet: **Extensions -> Apps Script**. Delete the sample code, paste
   the whole contents of `Code.gs` from this folder. Save (Cmd+S).
3. Click **Deploy -> New deployment**. Click the gear icon, choose **Web app**.
   - Description: leads
   - Execute as: **Me**
   - Who has access: **Anyone**  (required so the website can post; the URL is
     unguessable and it can only append rows, never read the sheet)
4. Click **Deploy**, authorise with your Google account, and copy the
   **Web app URL** (ends in `/exec`).
5. Open `js/locations.js` in this repo and paste the URL:
   `const LEADS_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";`
   Commit + push. Done - a "Leads" tab appears in the sheet on the first enquiry.

## Notes

- If you later edit Code.gs, use **Deploy -> Manage deployments -> edit ->
  new version** (a brand-new deployment changes the URL).
- Logging is fire-and-forget: if the sheet is ever unreachable, the WhatsApp
  message still opens normally - no lead is ever blocked by logging.
- Test after setup: submit the form on the live site, check the sheet for the row.
