"use strict";

// Einfacher clientseitiger Sichtschutz. Kein echter Sicherheitsmechanismus:
// Das Passwort ist im ausgelieferten JavaScript auffindbar.
const INTERNAL_PASSWORD = "Bratwurst";
const INTERNAL_SESSION_KEY = "cervilaetz-internal-unlocked";

const GIG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1hOgHLZSz79FAb-wgghb69LDW8zpJLEEJdj6MnAR_Uc4/export?format=csv&gid=0";

// Nach dem Deployment von Google Apps Script hier die Web-App-URL einfügen.
// Beispiel: const GUESTBOOK_API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
const GUESTBOOK_API_URL = "https://script.google.com/macros/s/AKfycbyvXUlOpFNWZ3jejJhl1_KUgjzGbOrtUkW7AdZHympbjW7a5hTNzpwUyucxUyCpJnFF/exec";

const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("internal-password");
const loginMessage = document.getElementById("login-message");
const internalContent = document.getElementById("internal-content");
const lockButton = document.getElementById("lock-button");

const gigsStatus = document.getElementById("gigs-status");
const gigsTableWrap = document.getElementById("gigs-table-wrap");
const refreshGigsButton = document.getElementById("refresh-gigs");

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

const renderGigTable = (rows) => {
  if (!gigsTableWrap) return;
  gigsTableWrap.replaceChildren();

  const [headers, ...bodyRows] = rows;
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

  gigsTableWrap.appendChild(table);
  gigsTableWrap.hidden = false;
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

    renderGigTable(rows);
    gigsStatus.textContent = `${Math.max(rows.length - 1, 0)} Einträge geladen.`;
    gigsStatus.className = "table-status success";
  } catch (error) {
    gigsStatus.textContent = "Die internen Gig-Daten konnten nicht geladen werden. Bitte prüfen, ob das Google Sheet im Web als CSV veröffentlicht ist.";
    gigsStatus.className = "table-status error";
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
refreshGuestbookButton?.addEventListener("click", loadGuestbookEntries);

setUnlockedState(sessionStorage.getItem(INTERNAL_SESSION_KEY) === "true");
