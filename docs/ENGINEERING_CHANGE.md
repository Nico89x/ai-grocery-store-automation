# Arbeitsprobe: eine Bestellung nach einem Neustart

## Ausgangsproblem

Die öffentliche 3D-Simulation hält Bestellungen und Bestand im Browser-Arbeitsspeicher. Ihr `inventoryApplied`-Merkmal schützt einen Retry innerhalb der Sitzung, belegt aber keine dauerhafte serverseitige Doppelbuchungssperre.

## Änderung und Begründung

Ein ergänzender lokaler Node.js-Server verwaltet Daten in SQLite. Der Client sendet Produkt-IDs, Mengen und einen Anfrageschlüssel. Preise kommen vom Server. Eine Transaktion prüft alle Positionen, reduziert Bestand und speichert den Beleg.

SQLite benötigt für diese Einzelbenutzer-Demo keinen separaten Datenbankdienst. `BEGIN IMMEDIATE` hält Prüfung und Buchung zusammen. Identische Wiederholungen liefern denselben Beleg; gleicher Schlüssel mit anderen Positionen führt zu HTTP 409. Der neue Web-Client macht den Ablauf ohne API-Werkzeug prüfbar. Der Produktkatalog ist gemeinsam, die Bestände der beiden Betriebsmodi sind getrennt.

Zusätzlich kopiert der 3D-Reducer bei weiteren Änderungen bereits abgeschlossene Belege nicht mehr tief. Veränderliche Ereignisse, Bestände und Kunden bleiben isoliert; Regressionstests prüfen, dass frühere Zustände unverändert bleiben.

## Nachweise

- [Daten- und HTTP-Tests](../server/store.test.mjs)
- [Browser-Ablauf](../e2e-backend/orders.spec.ts)
- [Isolation des Simulationszustands](../src/domain/state-isolation.test.ts)
- [Start, API-Vertrag und Grenzen](../server/README.md)

Die ergänzenden Prüfungen werden in GitHub Actions zusammen mit den bestehenden Tests und dem Produktionsbuild ausgeführt. Ergebnisse eines konkreten Laufs stehen im Actions-Verlauf; diese Beschreibung ersetzt kein Testergebnis.

## Fragen für einen persönlichen Erklärnachweis

Die Änderung entstand mit KI-Unterstützung. Eine eigenständige Beherrschung wird damit nicht behauptet. Nico kann seine Kenntnisse anhand dieser Fragen praktisch zeigen:

1. Warum müssen Bestandsprüfung und Buchung in derselben Transaktion liegen?
2. Was passiert, wenn die Antwort nach erfolgreichem COMMIT verloren geht?
3. Warum werden Positionen vor dem Vergleich sortiert?
4. Welche Objekte darf der React-Reducer gemeinsam nutzen?
5. Welche Maßnahmen fehlen vor einer öffentlichen Bereitstellung?
