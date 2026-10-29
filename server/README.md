# Persistente Bestell-Demo

Der lokale Node.js-/SQLite-Server ergänzt die 3D-Simulation um dauerhaft gespeicherte Bestellungen. Ein eigener Web-Client zeigt Bestand und Belege. Beide Modi verwenden denselben Produktkatalog, aber getrennte Bestände.

## Starten

**Node.js 24 oder neuer**. Für das Backend sind keine npm-Pakete erforderlich. Node 24 kann für das eingebaute SQLite-Modul einen experimentellen Hinweis anzeigen.

```sh
node server/start.mjs
```

Im Browser **http://127.0.0.1:4180** öffnen. Eine Menge auswählen und **Demo-Bestellung speichern**. Danach **Letzte Anfrage wiederholen**: derselbe Beleg wird geliefert, der Bestand nicht erneut gebucht. Nach Neuladen oder Neustart bleiben die Daten erhalten.

Die ignorierte Datei `data/store.sqlite` speichert die Beispieldaten; SQLite kann WAL-/SHM-Dateien daneben anlegen. `PORT` ändert den Port, `STORE_DB` den Datenbankpfad. Der Server bindet ausschließlich an `127.0.0.1`; diese Adresse statt localhost verwenden.

## Prüfen

```sh
node --test server/*.test.mjs
pnpm test:e2e:backend
```

Der erste Befehl prüft Neustart/Persistenz, identische und widersprüchliche Wiederholungen, Preise, Mengen, Rollback, zwei Datenbankverbindungen und den HTTP-Vertrag. Die Browserprüfung benötigt die installierten Projektabhängigkeiten und Playwright Chromium. Sie testet Speichern, Wiederholen, Neuladen, leere Auswahl und ein mobiles Layout.

## API-Vertrag

| Endpunkt           | Verhalten                                                               |
| ------------------ | ----------------------------------------------------------------------- |
| `GET /api/store`   | Preise, persistenter Bestand, Gesamtzahl und die letzten 20 Belege.     |
| `POST /api/orders` | Neue Bestellung: 201; identische Wiederholung: 200 mit demselben Beleg. |

```json
{
  "idempotencyKey": "demo-request-0001",
  "items": [{ "productId": "chips", "quantity": 1 }]
}
```

Preise stammen aus `src/domain/products.ts`. Vom Client gesetzte Preise, Kundendaten, unbekannte Felder, doppelte Positionen und ungültige Mengen werden abgelehnt. Positionen werden vor dem Vergleich sortiert. Ein Anfrageschlüssel gilt zusammen mit dem Inhalt seiner Bestellung und bleibt über Neustarts hinweg gespeichert.

| Status | Bedeutung                                                |
| ------ | -------------------------------------------------------- |
| 400    | Ungültiges JSON.                                         |
| 403    | Unerwarteter Host oder fremder Origin.                   |
| 409    | Bestandsmangel oder Anfrageschlüssel mit anderem Inhalt. |
| 413    | Request größer als 8 KiB.                                |
| 415    | Content-Type ist nicht application/json.                 |
| 422    | Ungültiges Bestellschema, Artikel oder Mengen.           |

## Entscheidungen und Grenzen

- SQLite-Transaktion mit `BEGIN IMMEDIATE`: gesamte Bestellung prüfen, Bestand buchen und Beleg speichern. Fehler erzeugen keine Teilbuchung.
- Gebundene SQL-Parameter und Datenbank-Constraints schützen die Datenintegrität.
- Der Server importiert den bestehenden TypeScript-Katalog mit der Type-Stripping-Unterstützung von Node 24.
- Der Client verwendet die gleiche Origin wie der Server. Fremde Origins und Hostnamen werden abgewiesen; es gibt keine CORS-Freigabe.
- Bei einer unbestätigten Antwort bleibt die letzte Anfrage zum Wiederholen erhalten. Neue Bestellungen sind bis zur Klärung gesperrt. Dieser Browserzustand überlebt kein Neuladen; gespeicherte Belege bleiben erhalten.
- Lokale Einzelbenutzer-Demo: kein Login, kein Rollenmodell, keine Zahlung, keine personenbezogenen Daten und keine externen Benachrichtigungen.
- Öffentliches Hosting, Backup/Restore, Monitoring, Rate-Limits, spätere Schema-Migrationen und Mehrbenutzerbetrieb benötigen zusätzliche Arbeit.
- Die öffentliche 3D-Simulation behält ihren eigenen Browserzustand. Das Backend sendet keine n8n-Webhooks und verwendet keine KI.

Konzept und Anforderungen: Nico Joschke. Implementierung, Dokumentation und Prüfungen entstanden mit KI-Unterstützung.
