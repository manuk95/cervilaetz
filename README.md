# The Cérvilätz - Statische Website

## Projektstruktur

```text
/
  index.html
  impressum.html
  datenschutz.html
  /css
    style.css
  /js
    main.js
  /images
  /assets
    /icons
```

## Lokaler Start

Da es eine reine statische Website ist, kann sie direkt im Browser geoeffnet werden.
Optional lokal mit einfachem Server:

```bash
python3 -m http.server 8000
```

Dann auf `http://localhost:8000` oeffnen.

## Inhalte bearbeiten

- **Texte bearbeiten:** In `index.html`, `impressum.html` und `datenschutz.html` sind alle Bereiche klar kommentiert (SECTION-Kommentare).
- **Navigation anpassen:** Die Menuepunkte befinden sich in `index.html` im Bereich `HEADER / NAVIGATION`.
- **CTA-Links anpassen:** Buttons im Hero und Header verweisen auf `#booking`.

## Bilder ersetzen

1. Neue Datei in `/images` ablegen.
2. In der entsprechenden HTML-Stelle den `src`-Pfad anpassen.
3. Alt-Text im `alt`-Attribut aktualisieren.

Wichtige Bildzuweisungen:
- Hero: `images/152_10y-jubi_gesamt_sitzend.jpg`
- Schlussbanner: `images/032_10y-jubi_gesamt_hinten.jpg`
- Logo/Favicon: `images/Cervilaetz_Logo_negativ_quadrat.jpg`
- Wortmarke: `images/Cervilaetz_Schriftzug_transparent.png`

## Neues Bandmitglied hinzufuegen

1. In `index.html` die Section `BAND MEMBERS` suchen.
2. Einen bestehenden `<article class="member-card">...</article>` Block kopieren.
3. Bild, Name und Instrument/Rolle eintragen.
4. Fertig - das Grid passt sich responsive automatisch an.

## Neue Galerie-Bilder hinzufuegen

1. In `index.html` die Section `GALLERY` suchen.
2. Einen `<figure class="gallery-item">...</figure>` Block duplizieren.
3. Neues Bild eintragen.

Hinweis: Das Layout ist so gebaut, dass mehrere Bilder ohne weiteres CSS funktionieren.

## Links aktualisieren

- **Spotify:** in der Section `REPERTOIRE` und im Footer in `index.html`.
- **Instagram/Facebook:** in der Section `BOOKING` und im Footer in `index.html`.
- **Rechtliches:** Footer-Links auf `impressum.html` und `datenschutz.html`.

## Impressum / Datenschutz bearbeiten

- `impressum.html` und `datenschutz.html` enthalten deutlich markierte Platzhaltertexte.
- Diese Platzhalter direkt durch finalen juristischen Inhalt ersetzen.

## Deployment auf GitHub Pages

1. Dateien auf den Hauptbranch pushen.
2. In GitHub: **Settings > Pages**.
3. Als Source den Branch (z. B. `main`) und Root (`/`) waehlen.
4. Speichern und die bereitgestellte URL oeffnen.

Keine Build-Pipeline notwendig.
