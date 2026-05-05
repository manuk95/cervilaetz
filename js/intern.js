"use strict";

// Einfacher clientseitiger Sichtschutz. Kein echter Sicherheitsmechanismus:
// Das Passwort ist im ausgelieferten JavaScript auffindbar.
const INTERNAL_PASSWORD = "Bratwurst";
const INTERNAL_SESSION_KEY = "cervilaetz-internal-unlocked";

const GIG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1hOgHLZSz79FAb-wgghb69LDW8zpJLEEJdj6MnAR_Uc4/export?format=csv&gid=0";
const SETLIST_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQt1344ZagywaSeOmg-hpkp-TOOOhLYqkxCXlRq1UGzlHhQRv7rqEAyRDrPVxVTEY0t08MjTWZAXSrg/pub?output=csv";

// Nach dem Deployment von Google Apps Script hier die Web-App-URL einfügen.
// Beispiel: const GUESTBOOK_API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
const GUESTBOOK_API_URL = "HIER_APPS_SCRIPT_WEB_APP_URL_EINFÜGEN";

const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("internal-password");
const loginMessage = document.getElementById("login-message");
const internalContent = document.getElementById("internal-content");
const lockButton = document.getElementById("lock-button");

const gigsStatus = document.getElementById("gigs-status");
const gigsTableWrap = document.getElementById("gigs-table-wrap");
const refreshGigsButton = document.getElementById("refresh-gigs");

const setlistStatus = document.getElementById("setlist-status");
const setlistTableWrap = document.getElementById("setlist-table-wrap");
const refreshSetlistButton = document.getElementById("refresh-setlist");

const guestbookForm = document.getElementById("guestbook-form");
const guestbookName = document.getElementById("guestbook-name");
const guestbookComment = document.getElementById("guestbook-comment");
const guestbookSubmit = document.getElementById("guestbook-submit");
const guestbookMessage = document.getElementById("guestbook-message");
const guestbookList = document.getElementById("guestbook-list");
const guestbookConfigNotice = document.getElementById("guestbook-config-notice");
const refreshGuestbookButton = document.getElementById("refresh-guestbook");

const isGuestbookConfigured = () => (
  GUESTBOOK_API_URL && !GUESTBOOK_API_URL.includes("HIER_APPS_SCRIPT_WEB_APP_URL")
);

const setMessage = (element, message, type = "") => {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`.trim();
};

const setUnlockedState = (isUnlocked) => {
  if (loginSection) loginSection.hidden = isUnlocked;
  if (internalContent) internalContent.hidden = !isUnlocked;

  if (isUnlocked) {
    loadGigTable();
    loadSetlistTable();
    setupGuestbook();
  } else {
    passwordInput?.focus();
  }
};

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const submittedPassword = passwordInput?.value ?? "";

  if (submittedPassword === INTERNAL_PASSWORD) {
    sessionStorage.setItem(INTERNAL_SESSION_KEY, "true");
    setMessage(loginMessage, "");
    if (passwordInput) passwordInput.value = "";
    setUnlockedState(true);
    return;
  }

  setMessage(loginMessage, "Das Passwort ist nicht korrekt.", "error");
  passwordInput?.focus();
});

lockButton?.addEventListener("click", () => {
  sessionStorage.removeItem(INTERNAL_SESSION_KEY);
  setUnlockedState(false);
});

const parseCsv = (csvText) => {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows
    .map((csvRow) => csvRow.map((cell) => cell.trim()))
    .filter((csvRow) => csvRow.some((cell) => cell !== ""));
};

const createInternalTable = (headers, bodyRows) => {
  const table = document.createElement("table");
  table.className = "internal-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header || " ";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  bodyRows.forEach((bodyRow) => {
    const tr = document.createElement("tr");
    headers.forEach((_, cellIndex) => {
      const td = document.createElement("td");
      td.textContent = bodyRow[cellIndex] ?? "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
};

const renderTableSection = (container, title, headers, rows, emptyText) => {
  const section = document.createElement("section");
  section.className = "table-subsection";

  const heading = document.createElement("h3");
  heading.textContent = title;
  section.appendChild(heading);

  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "guestbook-empty";
    empty.textContent = emptyText;
    section.appendChild(empty);
    container.appendChild(section);
    return;
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "responsive-table";
  tableWrap.appendChild(createInternalTable(headers, rows));
  section.appendChild(tableWrap);
  container.appendChild(section);
};

const parseSheetDate = (rawDate) => {
  const value = String(rawDate ?? "").trim();
  if (!value) return null;

  const swissDate = value.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})(?:\s+.*)?$/);
  if (swissDate) {
    const day = Number(swissDate[1]);
    const month = Number(swissDate[2]) - 1;
    const year = Number(swissDate[3].length === 2 ? `20${swissDate[3]}` : swissDate[3]);
    const parsed = new Date(year, month, day);
    if (parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
      return parsed;
    }
  }

  const isoDate = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]) - 1;
    const day = Number(isoDate[3]);
    const parsed = new Date(year, month, day);
    if (parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
      return parsed;
    }
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const renderGigTable = (rows) => {
  if (!gigsTableWrap) return;
  gigsTableWrap.replaceChildren();

  const [headers, ...bodyRows] = rows;
  const dateColumnIndex = headers.findIndex((header) => header.trim().toLowerCase() === "datum");

  if (dateColumnIndex === -1) {
    throw new Error('Die Spalte "Datum" wurde im Gig-Sheet nicht gefunden.');
  }

  const today = startOfToday();
  const rowsWithDate = bodyRows.map((row, originalIndex) => ({
    row,
    originalIndex,
    date: parseSheetDate(row[dateColumnIndex])
  }));

  const upcomingRows = rowsWithDate
    .filter((entry) => entry.date && entry.date >= today)
    .sort((a, b) => a.date - b.date || a.originalIndex - b.originalIndex)
    .map((entry) => entry.row);

  const pastRows = rowsWithDate
    .filter((entry) => entry.date && entry.date < today)
    .sort((a, b) => b.date - a.date || b.originalIndex - a.originalIndex)
    .map((entry) => entry.row);

  const undatedRows = rowsWithDate
    .filter((entry) => !entry.date)
    .map((entry) => entry.row);

  renderTableSection(gigsTableWrap, "Bevorstehende Gigs", headers, upcomingRows, "Aktuell sind keine bevorstehenden Gigs eingetragen.");
  renderTableSection(gigsTableWrap, "Vergangene Gigs", headers, pastRows, "Noch keine vergangenen Gigs vorhanden.");

  if (undatedRows.length > 0) {
    renderTableSection(gigsTableWrap, "Ohne gültiges Datum", headers, undatedRows, "");
  }

  gigsTableWrap.hidden = false;
  return { upcoming: upcomingRows.length, past: pastRows.length, undated: undatedRows.length };
};

const loadGigTable = async () => {
  if (!gigsStatus || !gigsTableWrap) return;
  gigsStatus.textContent = "Lade Daten...";
  gigsStatus.className = "table-status loading";
  gigsTableWrap.hidden = true;

  try {
    const response = await fetch(GIG_SHEET_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    if (rows.length < 1) {
      gigsStatus.textContent = "Im Google Sheet wurden noch keine Daten gefunden.";
      gigsStatus.className = "table-status";
      return;
    }

    const counts = renderGigTable(rows);
    const undatedText = counts.undated > 0 ? ` ${counts.undated} Einträge ohne gültiges Datum.` : "";
    gigsStatus.textContent = `${counts.upcoming} bevorstehende und ${counts.past} vergangene Gigs geladen.${undatedText}`;
    gigsStatus.className = "table-status success";
  } catch (error) {
    gigsStatus.textContent = "Die internen Gig-Daten konnten nicht geladen oder sortiert werden. Bitte prüfen, ob das Google Sheet im Web als CSV veröffentlicht ist und eine Spalte Datum enthält.";
    gigsStatus.className = "table-status error";
  }
};

const renderSetlistTable = (rows) => {
  if (!setlistTableWrap) return;
  setlistTableWrap.replaceChildren();
  const [headers, ...bodyRows] = rows;
  setlistTableWrap.appendChild(createInternalTable(headers, bodyRows));
  setlistTableWrap.hidden = false;
};

const loadSetlistTable = async () => {
  if (!setlistStatus || !setlistTableWrap) return;
  setlistStatus.textContent = "Lade Set-List...";
  setlistStatus.className = "table-status loading";
  setlistTableWrap.hidden = true;

  try {
    const response = await fetch(SETLIST_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const csvText = await response.text();
    const rows = parseCsv(csvText);

    if (rows.length < 1) {
      setlistStatus.textContent = "In der Set-List wurden noch keine Daten gefunden.";
      setlistStatus.className = "table-status";
      return;
    }

    renderSetlistTable(rows);
    setlistStatus.textContent = `${Math.max(rows.length - 1, 0)} Set-List-Einträge geladen.`;
    setlistStatus.className = "table-status success";
  } catch (error) {
    setlistStatus.textContent = "Die Set-List konnte nicht geladen werden. Bitte prüfen, ob das Google Sheet öffentlich als CSV veröffentlicht ist.";
    setlistStatus.className = "table-status error";
  }
};

const normalizeGuestbookEntries = (payload) => {
  const entries = Array.isArray(payload) ? payload : payload.entries;
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({
    name: String(entry.name ?? "Anonym").trim() || "Anonym",
    comment: String(entry.comment ?? "").trim(),
    timestamp: String(entry.timestamp ?? "").trim()
  })).filter((entry) => entry.comment !== "");
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Ohne Zeitstempel";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const renderGuestbookEntries = (entries) => {
  if (!guestbookList) return;
  guestbookList.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "guestbook-empty";
    empty.textContent = "Noch keine Gästebuch-Einträge vorhanden.";
    guestbookList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "guestbook-entry";

    const meta = document.createElement("div");
    meta.className = "guestbook-meta";

    const name = document.createElement("strong");
    name.textContent = entry.name;

    const time = document.createElement("time");
    time.dateTime = entry.timestamp;
    time.textContent = formatTimestamp(entry.timestamp);

    const comment = document.createElement("p");
    comment.textContent = entry.comment;

    meta.append(name, time);
    article.append(meta, comment);
    guestbookList.appendChild(article);
  });
};

const loadGuestbookEntries = async () => {
  if (!isGuestbookConfigured()) return;
  setMessage(guestbookMessage, "Lade Gästebuch-Einträge...", "loading");

  try {
    const response = await fetch(GUESTBOOK_API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.success === false) throw new Error(payload.error || "Apps Script Fehler");
    renderGuestbookEntries(normalizeGuestbookEntries(payload));
    setMessage(guestbookMessage, "");
  } catch (error) {
    setMessage(guestbookMessage, "Die Gästebuch-Einträge konnten nicht geladen werden.", "error");
  }
};

const setupGuestbook = () => {
  const configured = isGuestbookConfigured();
  if (guestbookConfigNotice) guestbookConfigNotice.hidden = configured;
  if (guestbookForm) guestbookForm.hidden = !configured;
  if (refreshGuestbookButton) refreshGuestbookButton.hidden = !configured;

  if (!configured) {
    renderGuestbookEntries([]);
    setMessage(guestbookMessage, "");
    return;
  }

  loadGuestbookEntries();
};

guestbookForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isGuestbookConfigured()) return;

  const name = (guestbookName?.value ?? "").trim().slice(0, 80);
  const comment = (guestbookComment?.value ?? "").trim().slice(0, 1000);

  if (!comment) {
    setMessage(guestbookMessage, "Bitte einen Kommentar eingeben.", "error");
    guestbookComment?.focus();
    return;
  }

  if (guestbookSubmit) guestbookSubmit.disabled = true;
  setMessage(guestbookMessage, "Sende Eintrag...", "loading");

  try {
    const response = await fetch(GUESTBOOK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ name, comment })
    });

    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }

    if (guestbookComment) guestbookComment.value = "";
    setMessage(guestbookMessage, "Danke! Dein Eintrag wurde gespeichert.", "success");
    renderGuestbookEntries(normalizeGuestbookEntries(payload));
  } catch (error) {
    setMessage(guestbookMessage, "Der Eintrag konnte nicht gespeichert werden. Bitte später erneut versuchen.", "error");
  } finally {
    if (guestbookSubmit) guestbookSubmit.disabled = false;
  }
});

refreshGigsButton?.addEventListener("click", loadGigTable);
refreshSetlistButton?.addEventListener("click", loadSetlistTable);
refreshGuestbookButton?.addEventListener("click", loadGuestbookEntries);

setUnlockedState(sessionStorage.getItem(INTERNAL_SESSION_KEY) === "true");
