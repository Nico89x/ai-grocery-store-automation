# Veröffentlichung und Bewerbung

## Öffentlich veröffentlicht

- Repository: [Nico89x/ai-grocery-store-automation](https://github.com/Nico89x/ai-grocery-store-automation)
- Live-Demo: [AI Grocery Store Automation](https://nico89x.github.io/ai-grocery-store-automation/)
- [Tests und Produktionsbuild](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794156) und [Pages-Veröffentlichung](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794197) am 8. Oktober 2026 erfolgreich.
- Die öffentliche Version wurde im Browser geprüft: direkter 3D-Produktklick, Chips-Bestand 4 → 3, eine Lagerwarnung, sechs erfolgreiche Events sowie Wasser-Fehler und Retry ohne zweiten Abzug.

Diese beiden Links können in Bewerbungen verwendet werden. Für die Demo ist keine Anmeldung erforderlich. Alle Abläufe sind ausdrücklich simuliert.

## Spätere Änderungen veröffentlichen

1. Änderungen an Quellcode und Dokumentation im main-Branch speichern; keine Zugangsdaten, node_modules, work oder dist einchecken.
2. **Tests and production build** und **Publish portfolio demo** unter Actions prüfen. Beide Workflows installieren aus dem Lockfile und führen 14 Logiktests, den TypeScript-/Produktionsbuild und zwölf Browserfälle aus.
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

## Ergänzungen vom 8. Oktober 2026

Die [Projektstudie](docs/CASE_STUDY.md) dokumentiert Konzept, Rolle, KI-Unterstützung, Architekturentscheidungen und Grenzen. Eine [echte 49,72-Sekunden-Aufnahme](docs/DEMO_VIDEO.md) zeigt Kauf, Lagerwarnung, Fehler/Retry und Kund:innen. Der [n8n-Testworkflow](automation/README.md) wurde per HTTP und direkt aus der App geprüft. 14 Logiktests und zwölf Browserfälle bestehen; CI prüft beides vor Veröffentlichung.

Noch bewusst offen: Produktionsbackend, dauerhafte Persistenz, serverseitige Idempotenz und simulierte Nachbestellung. Das sind Erweiterungen über die funktionsfähige Portfolio-Demo hinaus. Eine Lizenz sollte bewusst gewählt werden; das Projekt behauptet keine Produktionsintegration oder messbaren Geschäftserfolge.
