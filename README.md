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

## SEO / Suchmaschinen

Die Website ist auf die kanonische Adresse `https://www.cervilaetz.ch/` ausgerichtet. Wichtige technische SEO-Dateien:

- `robots.txt` verweist Suchmaschinen auf die Sitemap.
- `sitemap.xml` listet die indexierbaren Seiten auf.
- Die öffentlichen HTML-Seiten enthalten Canonical-, Open-Graph- und Twitter-Card-Metadaten.
- Die Startseite enthält strukturierte Daten (`MusicGroup`) mit Social-Profilen und regionalem Bezug.
- `intern.html` ist per Meta-Robots auf `noindex, nofollow` gesetzt, damit der interne Bereich nicht in Suchmaschinen erscheint.

### Domain / GitHub Pages

Aktuelle Hauptdomain im Repository: `www.cervilaetz.ch` in der Datei `CNAME`.

Damit sowohl `cervilaetz.ch` als auch `www.cervilaetz.ch` erreichbar sind:

1. In GitHub Pages `www.cervilaetz.ch` als Custom Domain hinterlegen und HTTPS erzwingen.
2. Beim DNS-Provider `www.cervilaetz.ch` als `CNAME` auf die GitHub-Pages-Adresse des Repositories zeigen lassen.
3. Für die Apex-Domain `cervilaetz.ch` die GitHub-Pages-`A`-Records oder beim Provider eine Weiterleitung auf `https://www.cervilaetz.ch/` konfigurieren.
4. Nach DNS-Änderungen einige Stunden warten und dann `https://cervilaetz.ch` sowie `https://www.cervilaetz.ch` testen.

### Google Search Console

Nach dem Deployment:

1. In der Google Search Console eine Domain-Property für `cervilaetz.ch` anlegen.
2. Die Domain per DNS-TXT-Eintrag verifizieren.
3. Die Sitemap `https://www.cervilaetz.ch/sitemap.xml` einreichen.
4. Mit der URL-Prüfung `https://www.cervilaetz.ch/` prüfen und Indexierung beantragen.
5. In den nächsten Tagen die Berichte zu Indexierung, Crawling und Suchanfragen beobachten.
