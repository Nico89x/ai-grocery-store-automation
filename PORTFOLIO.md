# Veröffentlichung und Bewerbung

## Öffentlich veröffentlicht

- Repository: [Nico89x/ai-grocery-store-automation](https://github.com/Nico89x/ai-grocery-store-automation)
- Live-Demo: [AI Grocery Store Automation](https://nico89x.github.io/ai-grocery-store-automation/)
- [Tests und Produktionsbuild](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794156) und [Pages-Veröffentlichung](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794197) am 8. Oktober 2026 erfolgreich.
- Die öffentliche Version wurde im Browser geprüft: direkter 3D-Produktklick, Chips-Bestand 4 → 3, eine Lagerwarnung, sechs erfolgreiche Events sowie Wasser-Fehler und Retry ohne zweiten Abzug.

Diese beiden Links können in Bewerbungen verwendet werden. Für die Demo ist keine Anmeldung erforderlich. Alle Abläufe sind ausdrücklich simuliert.

## Spätere Änderungen veröffentlichen

1. Änderungen an Quellcode und Dokumentation im main-Branch speichern; keine Zugangsdaten, node_modules, work oder dist einchecken.
2. **Tests and production build** und **Publish portfolio demo** unter Actions prüfen. Beide Workflows installieren aus dem Lockfile und führen zwölf Tests sowie den TypeScript-/Produktionsbuild aus.
3. Pages verwendet **GitHub Actions** als Quelle. Die Repository-Variable **ENABLE_PAGES=true** ist gesetzt. Der Pages-Workflow veröffentlicht nur einen erfolgreichen Build.
4. Die Live-Demo im Browser nachprüfen, besonders Warnungsfall und Retry. Der lokale Link 127.0.0.1 funktioniert ausschließlich auf dem eigenen Computer.
5. Entwicklung und Prüfergebnisse ehrlich dokumentieren; keine erfundene Commit-Historie, Produktionskunden oder Leistungskennzahlen.

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
