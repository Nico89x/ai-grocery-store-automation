# Entwicklung

Node.js 22.12+ und pnpm 11.25.0 verwenden. Mit pnpm install --frozen-lockfile installieren; pnpm dev startet die Anwendung. Alle Laufzeitassets sind lokal enthalten.

Vor einem Pull Request:

```bash
pnpm format
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Die Browserfälle testen Desktop und Mobilansicht. Neue Tests sollen beobachtbares Verhalten und Zustandsgrenzen prüfen. Den vollständigen Kauf-, Warnungs- und Retry-Ablauf zusätzlich manuell ansehen. Quellen/Lizenzen neuer Assets in THIRD_PARTY_ASSETS.md dokumentieren.

Keine Zugangsdaten oder echten Kundendaten einchecken. .env.local, node_modules, dist, work und Testberichte bleiben lokal. Änderungen an der Bestellverarbeitung dürfen weder negative Bestände noch Teilbuchungen oder doppelte Retry-Buchungen erzeugen. Preisberechnung erfolgt in ganzen Cent.

Die Veröffentlichungsworkflows prüfen den Branch und veröffentlichen main nur nach erfolgreichen Tests. Bestellungen bleiben ausdrücklich synthetisch; echte Benachrichtigungen oder Zahlungen gehören nicht in diese Demo.
