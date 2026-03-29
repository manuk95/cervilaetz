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

// reCAPTCHA validation for booking form
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    const hasRecaptcha = typeof window.grecaptcha !== "undefined";
    if (!hasRecaptcha) return;

    const token = window.grecaptcha.getResponse();
    if (!token) {
      event.preventDefault();
      alert("Bitte bestaetige zuerst, dass du kein Roboter bist.");
    }
  });
}
