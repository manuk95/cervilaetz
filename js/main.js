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
