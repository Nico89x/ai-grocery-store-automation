# Veröffentlichung und Bewerbung

## Aktueller Stand

Die Anwendung ist eine lokal geprüfte Portfolio-Demo. Ein öffentliches GitHub-Repository und eine öffentliche Demo-URL sind noch nicht eingerichtet. Der lokale Link `127.0.0.1` ist für Arbeitgeber nicht erreichbar. Die enthaltenen GitHub-Workflows sind vorbereitet; sie wurden noch nicht auf GitHub ausgeführt.

## In dieser Reihenfolge veröffentlichen

1. Auf deinem GitHub-Konto ein öffentliches Repository `ai-grocery-store-automation` erstellen. Den vollständigen Quellcode aus dem Download entpacken und hochladen, einschließlich `.github`, `docs` und `.gitignore`. `node_modules`, `work`, `dist` und `.env.local` werden nicht eingecheckt. Keine erfundene Commit-Historie: erste Version und spätere Änderungen ehrlich dokumentieren.
2. Den `main`-Branch verwenden. Die Aktion **Tests and production build** prüft Lockfile-Installation, zwölf Tests, TypeScript und Produktionsbuild bei Pushes und Pull Requests.
3. Unter **Settings → Pages → Source** „GitHub Actions“ auswählen. Unter **Settings → Secrets and variables → Actions → Variables** die Repository-Variable `ENABLE_PAGES` mit dem Wert `true` anlegen. Dann **Publish portfolio demo** manuell starten. Die öffentliche URL entsteht erst bei erfolgreicher Veröffentlichung. Ohne diese Freigabe überspringt der Workflow die Veröffentlichung.
4. Die tatsächliche Demo-URL in die Repository-Beschreibung unter „Website“, oben in die README und in dein Bewerbungsportfolio eintragen. Repository im GitHub-Profil anheften. Passende Topics: `react`, `typescript`, `threejs`, `automation`, `portfolio`, `inventory-management`.
5. Den öffentlichen Link im privaten Browserfenster testen, besonders „1 × Kesselchips kaufen“, Warnung und Retry. Auch die Screenshots im Repository müssen sichtbar sein.

Offizielle Anleitungen: [GitHub Pages mit Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) und [Vite veröffentlichen](https://vite.dev/guide/static-deploy.html). Der Build verwendet relative Asset-URLs für Repository-Unterpfade; Hash-Routen vermeiden Server-Routing-Konfiguration.

## Kurzbeschreibung für das Repository

Interactive 3D grocery store with a local event-driven automation engine, inventory management, observable order workflows, safe retries and an optional webhook adapter. Built with React, TypeScript and React Three Fiber. Portfolio simulation; no payments or real orders.

## Was du im Bewerbungsgespräch zeigen kannst

- **Problem:** Ein Kauf muss nachvollziehbar in Lagerbuchung, Warnung und Abschluss übersetzt werden.
- **Lösung:** Ein gemeinsamer lokaler Reducer verarbeitet manuelle Käufe und animierte Kunden über eine Queue. Bestandsprüfung und Buchung erfolgen für die komplette Bestellung.
- **Robustheit:** Retry nach einem Fehler setzt nach bereits erfolgter Buchung fort; Bestand und Warnung werden nicht doppelt verarbeitet. Der optionale Webhook ist vom lokalen Ablauf getrennt.
- **Nachweis:** Automatische Logiktests, sichtbare Events mit Zeitstempeln, manueller Browserprüflauf und nachvollziehbare Architektur in der README.
- **Abgrenzung:** Keine Produktionsintegration, keine echten Bestellungen, kein echtes KI-Modell, keine behaupteten Umsatz- oder Produktivitätszahlen. Die Assistenz antwortet regelbasiert.

## Sinnvolle Ergänzungen nach Veröffentlichung

Eine kurze selbst aufgenommene Demo (45–60 Sekunden), ein echter n8n-Testworkflow mit ausschließlich Testdaten und ein Export der Ereignisse stärken die Präsentation. Ergänze die persönliche Rolle und den Einsatz von Entwicklungswerkzeugen ehrlich. Eine Lizenz sollte bewusst gewählt werden; für reine Einsicht durch Arbeitgeber ist keine pauschale Freigabe zur Weiterverwendung erforderlich. Eine Produktionsanwendung würde ein Backend, serverseitige Transaktionen und Authentifizierung benötigen.
