# Lokale Übersetzung

Die App verwendet eine selbst gehostete LibreTranslate-Instanz. Texte bleiben auf diesem Rechner; ein API-Key ist nicht erforderlich.

## Starten

Einmalig einrichten:

```powershell
py -3.13 -m venv .venv-libretranslate
.\.venv-libretranslate\Scripts\python.exe -m pip install -r requirements-translate.txt
```

Zwei Terminals im Projektordner öffnen:

```powershell
npm run translate
```

```powershell
npm run dev
```

- Webseite: http://127.0.0.1:5173
- LibreTranslate: http://127.0.0.1:5000

Beim ersten Start lädt LibreTranslate die Modelle für Deutsch und Englisch. Spätere Starts verwenden die lokal installierten Modelle.

## Technische Hinweise

- Die Python-Umgebung liegt unter `.venv-libretranslate` und wird nicht in Git aufgenommen.
- Vite leitet `/api/translate` an LibreTranslate auf Port 5000 weiter.
- Eingaben und Übersetzungen werden nicht in `localStorage` gespeichert.
- Die Texterkennung aus Bildern läuft ebenfalls lokal mit Tesseract.js.
