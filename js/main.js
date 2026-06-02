"use strict";

// Mobile navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const siteHeader = document.getElementById("site-header");

if (navToggle && navPanel) {
  navToggle.addEventListener("click", () => {
    const isOpen = navPanel.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Menue schliessen" : "Menue oeffnen");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navPanel.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menue oeffnen");
    }
  });

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navPanel.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menue oeffnen");
    });
  });
}

// Header state on scroll
const handleHeaderScroll = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 28);
};
window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

// Smooth scroll enhancement and active nav state
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...document.querySelectorAll("main section[id]")];

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    event.preventDefault();
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const setActiveLink = () => {
  let currentId = "";
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) {
      currentId = `#${section.id}`;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentId);
  });
};

window.addEventListener("scroll", setActiveLink);
setActiveLink();

// Footer year sync
document.querySelectorAll("#year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Gallery rendering and lightbox
const galleryImages = [
  "008_10y-jubi_gesamt_formell.jpg",
  "019_10y-jubi_gesamt_fun.jpg",
  "023_10y-jubi-t-shirt.jpg",
  "138_10y-jubi_linus_komisch.jpg",
  "156_10y-jubi-pauke.jpg",
  "162_10y-jubi-statute.jpg",
  "165_10y-jubi_blache.jpg",
  "207_10y-jubi-auftritt.jpg",
  "219_10y-jubi-remo-spielt.jpg",
  "220_10y-jubi-t-shirt-back.jpg",
  "grundopenaire_2022_01.jpeg",
  "grundopenaire_2022_02.jpeg"
];

const galleryGrid = document.getElementById("gallery-grid");
const lightbox = document.getElementById("gallery-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxClose = document.getElementById("lightbox-close");
let activeGalleryIndex = 0;
let touchStartX = 0;

const updateLightboxImage = () => {
  const src = `images/gallery/${galleryImages[activeGalleryIndex]}`;
  lightboxImage.src = src;
  lightboxImage.alt = `Galeriebild ${activeGalleryIndex + 1} von ${galleryImages.length}`;
};

const openLightbox = (index) => {
  activeGalleryIndex = index;
  updateLightboxImage();
  lightbox.showModal();
};

const stepLightbox = (step) => {
  activeGalleryIndex = (activeGalleryIndex + step + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
};

if (galleryGrid && lightbox && lightboxImage) {
  galleryImages.forEach((filename, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const img = document.createElement("img");
    img.src = `images/gallery/${filename}`;
    img.alt = `Galeriebild ${index + 1}`;
    img.loading = "lazy";
    img.addEventListener("click", () => openLightbox(index));

    figure.appendChild(img);
    galleryGrid.appendChild(figure);
  });

  lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
  lightboxNext?.addEventListener("click", () => stepLightbox(1));
  lightboxClose?.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    const clickedOutside = event.target === lightbox;
    if (clickedOutside) lightbox.close();
  });

  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  });

  lightbox.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 40) return;
    stepLightbox(deltaX > 0 ? -1 : 1);
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });
}


// Public gig table from the published Google Sheet
const PUBLIC_GIG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1hOgHLZSz79FAb-wgghb69LDW8zpJLEEJdj6MnAR_Uc4/export?format=csv&gid=0";
const PUBLIC_GIG_VISIBLE_HEADERS = ["Datum", "Anlass", "Ort", "Auftritt"];
const PUBLIC_GIG_VISIBILITY_HEADERS = [
  "öffentlich",
  "oeffentlich",
  "public",
  "website",
  "anzeigen",
  "sichtbarkeit"
];
const PUBLIC_GIG_VISIBLE_VALUES = ["1", "true", "wahr", "yes", "ja", "x", "öffentlich", "oeffentlich", "public"];
const PUBLIC_GIG_HIDDEN_VALUES = ["0", "false", "falsch", "no", "nein", "privat", "nicht öffentlich", "nicht oeffentlich"];

const publicGigsStatus = document.getElementById("public-gigs-status");
const publicGigsTableWrap = document.getElementById("public-gigs-table-wrap");

const normalizePublicGigToken = (value) => String(value ?? "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[?*!:]/g, "")
  .replace(/\s+/g, " ");

const parsePublicGigCsv = (csvText) => {
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

const parsePublicGigDate = (rawDate) => {
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

const getPublicGigStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const setPublicGigsStatus = (message, type = "") => {
  if (!publicGigsStatus) return;
  publicGigsStatus.textContent = message;
  publicGigsStatus.className = `table-status ${type}`.trim();
};

const getPublicGigColumnIndex = (headers, headerName) => {
  const normalizedHeaderName = normalizePublicGigToken(headerName);
  return headers.findIndex((header) => normalizePublicGigToken(header) === normalizedHeaderName);
};

const getPublicGigVisibilityColumnIndex = (headers) => headers.findIndex((header) => {
  const normalizedHeader = normalizePublicGigToken(header);
  return PUBLIC_GIG_VISIBILITY_HEADERS.some((candidate) => normalizedHeader.includes(normalizePublicGigToken(candidate)));
});

const isPublicGigRowVisible = (row, visibilityColumnIndex) => {
  if (visibilityColumnIndex === -1) return false;
  const value = normalizePublicGigToken(row[visibilityColumnIndex]);
  if (!value || PUBLIC_GIG_HIDDEN_VALUES.some((hiddenValue) => value.includes(hiddenValue))) return false;
  return PUBLIC_GIG_VISIBLE_VALUES.includes(value) || value.includes("offentlich") || value.includes("public");
};

const renderPublicGigTable = (rows) => {
  if (!publicGigsTableWrap) return 0;
  publicGigsTableWrap.replaceChildren();

  const [headers, ...bodyRows] = rows;
  const dateColumnIndex = getPublicGigColumnIndex(headers, "Datum");
  const visibilityColumnIndex = getPublicGigVisibilityColumnIndex(headers);
  const visibleColumnIndexes = PUBLIC_GIG_VISIBLE_HEADERS.map((header) => getPublicGigColumnIndex(headers, header));

  if (dateColumnIndex === -1) {
    throw new Error('Die Spalte "Datum" wurde im Gig-Sheet nicht gefunden.');
  }

  if (visibilityColumnIndex === -1) {
    throw new Error("Im Gig-Sheet wurde keine Spalte für öffentliche Auftritte gefunden.");
  }

  if (visibleColumnIndexes.some((index) => index === -1)) {
    throw new Error("Im Gig-Sheet fehlen eine oder mehrere öffentliche Spalten.");
  }

  const today = getPublicGigStartOfToday();
  const upcomingPublicRows = bodyRows
    .map((row, originalIndex) => ({
      row,
      originalIndex,
      date: parsePublicGigDate(row[dateColumnIndex])
    }))
    .filter((entry) => entry.date && entry.date >= today && isPublicGigRowVisible(entry.row, visibilityColumnIndex))
    .sort((a, b) => a.date - b.date || a.originalIndex - b.originalIndex)
    .map((entry) => visibleColumnIndexes.map((columnIndex) => entry.row[columnIndex] ?? ""));

  if (upcomingPublicRows.length === 0) {
    publicGigsTableWrap.hidden = true;
    return 0;
  }

  const table = document.createElement("table");
  table.className = "internal-table public-gigs-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  PUBLIC_GIG_VISIBLE_HEADERS.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  upcomingPublicRows.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  publicGigsTableWrap.appendChild(table);
  publicGigsTableWrap.hidden = false;
  return upcomingPublicRows.length;
};

const loadPublicGigs = async () => {
  if (!publicGigsStatus || !publicGigsTableWrap) return;
  setPublicGigsStatus("Lade öffentliche Auftritte...", "loading");
  publicGigsTableWrap.hidden = true;

  try {
    const response = await fetch(PUBLIC_GIG_SHEET_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const csvText = await response.text();
    const rows = parsePublicGigCsv(csvText);

    if (rows.length < 1) {
      setPublicGigsStatus("Im Google Sheet wurden noch keine Auftritte gefunden.");
      return;
    }

    const count = renderPublicGigTable(rows);
    if (count === 0) {
      setPublicGigsStatus("Aktuell sind keine kommenden öffentlichen Auftritte geplant.");
      return;
    }

    setPublicGigsStatus(`${count} kommende öffentliche Auftritte geladen.`, "success");
  } catch (error) {
    setPublicGigsStatus("Die öffentlichen Auftritte konnten nicht geladen werden. Bitte später erneut versuchen.", "error");
  }
};

loadPublicGigs();

// Math captcha for booking form
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
  const captchaQuestion = document.getElementById("captcha-question");
  const captchaAnswer = document.getElementById("captcha-answer");
  const firstNumber = Math.floor(Math.random() * 10) + 1;
  const secondNumber = Math.floor(Math.random() * 10) + 1;
  const expectedAnswer = firstNumber + secondNumber;

  if (captchaQuestion) {
    captchaQuestion.textContent = `Spam-Schutz: Was ist ${firstNumber} + ${secondNumber}? *`;
  }

  bookingForm.addEventListener("submit", (event) => {
    const submittedAnswer = Number(captchaAnswer?.value);
    if (submittedAnswer !== expectedAnswer) {
      event.preventDefault();
      alert("Bitte loese die Rechnung korrekt.");
      captchaAnswer?.focus();
    }
  });
}
