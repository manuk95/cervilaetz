/**
 * Google Apps Script fuer das interne Gaestebuch von The Cervilaetz.
 *
 * Installation:
 * 1. Gaestebuch-Sheet oeffnen:
 *    https://docs.google.com/spreadsheets/d/14S222oPgGObQJtP_dkkKX-XtEPlU1ZeSI7dnb0SvFAs/edit?usp=sharing
 * 2. Erweiterungen > Apps Script oeffnen.
 * 3. Diesen Code einfuegen, speichern und als Web-App bereitstellen.
 * 4. Die Web-App-URL in js/intern.js bei GUESTBOOK_API_URL eintragen.
 */

const SPREADSHEET_ID = '14S222oPgGObQJtP_dkkKX-XtEPlU1ZeSI7dnb0SvFAs';
const SHEET_NAME = 'Gaestebuch';
const HEADERS = ['timestamp', 'name', 'comment'];
const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 1000;

function doGet() {
  try {
    return jsonResponse({
      success: true,
      entries: getEntries_()
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Die Gaestebuch-Eintraege konnten nicht geladen werden.'
    });
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const cleaned = validatePayload_(payload);
    const sheet = getGuestbookSheet_();
    const timestamp = new Date().toISOString();

    sheet.appendRow([timestamp, cleaned.name, cleaned.comment]);

    return jsonResponse({
      success: true,
      message: 'Eintrag gespeichert.',
      entries: getEntries_()
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message || 'Der Eintrag konnte nicht gespeichert werden.'
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Es wurden keine Daten uebermittelt.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Die uebermittelten Daten sind kein gueltiges JSON.');
  }
}

function validatePayload_(payload) {
  const name = String(payload.name || 'Anonym').trim().slice(0, MAX_NAME_LENGTH) || 'Anonym';
  const comment = String(payload.comment || '').trim().slice(0, MAX_COMMENT_LENGTH);

  if (!comment) {
    throw new Error('Bitte einen Kommentar eingeben.');
  }

  return { name, comment };
}

function getEntries_() {
  const sheet = getGuestbookSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .map(function(row) {
      const timestamp = row[0] instanceof Date ? row[0].toISOString() : String(row[0] || '').trim();
      return {
        timestamp: timestamp,
        name: String(row[1] || 'Anonym').trim() || 'Anonym',
        comment: String(row[2] || '').trim()
      };
    })
    .filter(function(entry) {
      return entry.comment !== '';
    })
    .sort(function(a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
}

function getGuestbookSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeader_(sheet);
  return sheet;
}

function ensureHeader_(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = HEADERS.some(function(header, index) {
    return currentHeaders[index] !== header;
  });

  if (needsHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
