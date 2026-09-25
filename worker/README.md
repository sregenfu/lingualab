# LinguaLab Cloudflare Worker

## Einmalig veröffentlichen

1. Node.js und Wrangler installieren: `npm install -g wrangler`
2. Bei Cloudflare anmelden: `wrangler login`
3. In diesen Ordner wechseln: `cd worker`
4. Veröffentlichen: `wrangler deploy`

Danach lautet die API-Adresse normalerweise:

`https://lingualab-translator.<dein-cloudflare-account>.workers.dev`

Im GitHub-Repository unter **Settings > Secrets and variables > Actions > Variables** diese Repository-Variable anlegen:

`VITE_TRANSLATE_API_URL=https://lingualab-translator.<dein-cloudflare-account>.workers.dev`

Danach einen neuen Push auf `main` auslösen. Die GitHub-Pages-App verwendet dann den Worker für Übersetzungen.
