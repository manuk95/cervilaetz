# Interner Bereich: Einrichtung

Diese Website enthält mit `intern.html` einen einfachen internen Bereich mit clientseitiger Passwortabfrage, Anzeige eines Google Sheets und einem Gästebuch über Google Apps Script.

## 1. Gig-Google-Sheet als CSV veröffentlichen

Datenquelle für interne Gigs und Infos:

<https://docs.google.com/spreadsheets/d/1hOgHLZSz79FAb-wgghb69LDW8zpJLEEJdj6MnAR_Uc4/edit?usp=sharing>

Damit GitHub Pages das Sheet ohne API-Key und ohne OAuth lesen kann, muss es als CSV abrufbar sein:

1. Gig-Google-Sheet öffnen.
2. In Google Sheets auf **Datei > Teilen > Im Web veröffentlichen** gehen.
3. Das gewünschte Tabellenblatt auswählen.
4. Als Format **CSV** wählen.
5. Veröffentlichung bestätigen.

Die Website verwendet aktuell diese CSV-Export-URL in `js/intern.js`:

```js
const GIG_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1hOgHLZSz79FAb-wgghb69LDW8zpJLEEJdj6MnAR_Uc4/export?format=csv&gid=0";
```

Falls ein anderes Tabellenblatt genutzt wird, muss die `gid` in dieser Konstante angepasst werden. Es werden keine Google API Keys und keine OAuth-Logins verwendet.

Die Gig-Tabelle muss eine Spalte mit der Überschrift `Datum` enthalten. Bevorstehende Gigs werden nach Datum aufsteigend angezeigt; vergangene Gigs erscheinen darunter in einer separaten Tabelle, mit den neusten vergangenen Gigs zuerst.

## 2. Set-List-Google-Sheet

Die interne Seite lädt zusätzlich diese veröffentlichte Set-List als CSV:

<https://docs.google.com/spreadsheets/d/e/2PACX-1vQt1344ZagywaSeOmg-hpkp-TOOOhLYqkxCXlRq1UGzlHhQRv7rqEAyRDrPVxVTEY0t08MjTWZAXSrg/pub?output=csv>

Die URL ist in `js/intern.js` hinterlegt:

```js
const SETLIST_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQt1344ZagywaSeOmg-hpkp-TOOOhLYqkxCXlRq1UGzlHhQRv7rqEAyRDrPVxVTEY0t08MjTWZAXSrg/pub?output=csv";
```

Falls die Set-List später in ein anderes Sheet verschoben wird, muss diese Konstante angepasst werden.

## 3. Gästebuch-Google-Apps-Script erstellen

Das Gästebuch speichert dauerhaft in diesem separaten Google Sheet:

<https://docs.google.com/spreadsheets/d/14S222oPgGObQJtP_dkkKX-XtEPlU1ZeSI7dnb0SvFAs/edit?usp=sharing>

Einrichtung:

1. Google Sheet öffnen: <https://docs.google.com/spreadsheets/d/14S222oPgGObQJtP_dkkKX-XtEPlU1ZeSI7dnb0SvFAs/edit?usp=sharing>
2. **Erweiterungen > Apps Script** öffnen.
3. Inhalt aus `apps-script-guestbook.js` vollständig einfügen.
4. Speichern.
5. **Bereitstellen > Neue Bereitstellung > Web-App** wählen.
6. **Ausführen als:** Ich.
7. **Zugriff:** Jeder.
8. Bereitstellung abschliessen und die Web-App-URL kopieren.
9. URL in `js/intern.js` bei `GUESTBOOK_API_URL` eintragen:

```js
const GUESTBOOK_API_URL = "HIER_APPS_SCRIPT_WEB_APP_URL_EINFÜGEN";
```

Nach dem Eintragen der URL muss GitHub Pages neu deployed werden, damit das Gästebuch auf der Website aktiv ist.

Solange die Web-App-URL noch nicht eingetragen ist, zeigt die interne Seite einen neutralen Hinweis an und das Gästebuch-Formular bleibt deaktiviert.

## 4. Sicherheitshinweis

Der Passwortschutz ist nur clientseitig und nicht sicher. Das Passwort ist im JavaScript auffindbar. Für wirklich vertrauliche Daten wäre GitHub Pages mit clientseitigem Passwortschutz nicht ausreichend.

Für die hier genannten internen Gig-Infos ist diese Lösung nur als einfache Hürde gedacht und nur akzeptabel, wenn der Betreiber das bewusst so will.
