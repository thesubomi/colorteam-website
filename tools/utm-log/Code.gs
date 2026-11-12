/**
 * Colorteam UTM Link Log: the save and read endpoint for colorteam.io/utm.
 *
 * Lives inside the "Colorteam UTM Link Log" Google Sheet (Extensions > Apps Script).
 * Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * Paste the /exec URL into LOG_ENDPOINT at the top of the script in src/pages/utm.astro.
 *
 * GET  returns the newest 1,000 links as JSON.
 * POST appends one link (JSON body), skipping exact duplicates.
 */
const SHEET_NAME = 'Links';
const MAX_ROWS_RETURNED = 1000;
const COLS = 10; // Created, Created by, Label, Source, Medium, Campaign, Content, Page, Tracked link, Form answers

function doGet() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  let links = [];
  if (last > 1) {
    const start = Math.max(2, last - MAX_ROWS_RETURNED + 1);
    const rows = sheet.getRange(start, 1, last - start + 1, COLS).getValues();
    links = rows
      .filter(function (r) { return r[8]; })
      .map(function (r) {
        return {
          createdAt: r[0] instanceof Date ? r[0].getTime() : null,
          createdBy: String(r[1] || ''),
          label: String(r[2] || ''),
          source: String(r[3] || ''),
          medium: String(r[4] || ''),
          campaign: String(r[5] || ''),
          content: String(r[6] || ''),
          destination: String(r[7] || ''),
          url: String(r[8] || ''),
          form: parse_(r[9])
        };
      })
      .reverse();
  }
  return json_({ ok: true, links: links });
}

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }
  const url = clean_(d.url, 2000);
  if (!/^https:\/\/\S+$/.test(url) || !/[?&]utm_source=/.test(url)) {
    return json_({ ok: false, error: 'invalid_link' });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    if (last > 1) {
      const urls = sheet.getRange(2, 9, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
      if (urls.indexOf(url) >= 0) return json_({ ok: true, duplicate: true });
    }
    sheet.appendRow([
      new Date(),
      safe_(clean_(d.createdBy, 60)),
      safe_(clean_(d.label, 140)),
      safe_(clean_(d.source, 60)),
      safe_(clean_(d.medium, 60)),
      safe_(clean_(d.campaign, 120)),
      safe_(clean_(d.content, 200)),
      safe_(clean_(d.destination, 2000)),
      url,
      JSON.stringify(d.form && typeof d.form === 'object' ? d.form : {}).slice(0, 2000)
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function getSheet_() {
  return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
}
function clean_(v, n) {
  return String(v == null ? '' : v).trim().slice(0, n);
}
// Stop text that starts with = + - @ from being read as a formula.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function parse_(v) {
  try { return JSON.parse(v); } catch (e) { return {}; }
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
