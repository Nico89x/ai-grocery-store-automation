# Das Projekt im Bewerbungsgespräch erklären

## Ein Satz

„Ich habe eine interaktive 3D-Einkaufsdemo konzipiert, in der man den gesamten Weg von der Produktwahl bis zur Lagerwarnung beobachten kann; ein optionaler n8n-Workflow bestätigt echte Testereignisse.“

## Vorführung in zwei Minuten

1. Den öffentlichen Simulationslink öffnen. Die Kund:innen zunächst pausiert lassen.
2. Chips auswählen, Warenkorb zeigen und einen Demo-Kauf auslösen. Auf Bestand 4 → 3, Mindestbestand 4 und die sechs Ereignisse hinweisen.
3. Fehler-Schalter aktivieren, Wasser kaufen und Retry zeigen: Bestand bleibt nach der Wiederholung bei 14.
4. Kund:innen starten: automatische Käufe verwenden denselben Prozessor.
5. Bei einer vorbereiteten lokalen n8n-Vorführung den Empfangsbeleg mit Ausführungs-ID zeigen. Auf fremden Geräten funktioniert die öffentliche Demo vollständig lokal.

## Entscheidungen, die du am Code erklären kannst

| Frage                                   | Beleg / Erklärung                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Warum ein Reducer?                      | Bestelllogik unabhängig vom 3D-Rendering; src/domain/simulation.ts ist ohne WebGL testbar.                 |
| Warum Cent-Werte?                       | Ganze Zahlen verhindern übliche Dezimalrundungsfehler; Preise bleiben im Bestellsnapshot erhalten.         |
| Was passiert bei gleichzeitigen Käufen? | Eine Queue prüft alle Artikel erneut unmittelbar vor der gemeinsamen Buchung.                              |
| Warum kein doppelter Abzug beim Retry?  | inventoryApplied bleibt erhalten; nur der fehlgeschlagene Abschluss wird wiederholt.                       |
| Was bedeutet observierbar?              | Pro Bestellung sichtbar: Status, Versuch, Zeitpunkt, Beschreibung und Ereignisprotokoll.                   |
| Was macht n8n?                          | Empfängt order.completed, validiert Testdaten, erzeugt simulierte Warnungsdaten und bestätigt den Empfang. |
| Wie bleibt die Demo unabhängig?         | Kein Endpunkt nötig; ein Webhook-Ausfall nimmt die lokale Lagerbuchung nicht zurück.                       |

## Deine Rolle korrekt darstellen

Konzept, Anforderungen und Zielbild wurden von Nico89x vorgegeben; Code, Dokumentation und Prüfungen entstanden mit KI-Unterstützung. Der eigene Beitrag und der Einsatz von Hilfsmitteln werden offen beschrieben. Nicht behaupten, alle Charaktermodelle selbst modelliert oder die Implementierung vollständig ohne Unterstützung geschrieben zu haben.

## Grenzen offen benennen

Keine Produktionskunden, Zahlung, echte Bestellung, Nachricht oder KI-API. Kein dauerhaftes Lager, kein serverseitiges Warenwirtschaftssystem und keine garantierte externe Zustellung. Der n8n-Empfänger ist stateless: ein Ereignisschlüssel ist noch keine dauerhafte Deduplizierung. Mobile Browseransichten wurden getestet; echte Geräte müssen separat geprüft werden.

## Nächster technischer Schritt

Ein Backend mit Datenbank, transaktionaler Bestandsbuchung, dauerhafter Idempotenz und Outbox für externe Ereignisse. Erst dann lassen sich Persistenz und zuverlässige Zustellung unabhängig von einer geöffneten Browserseite garantieren.
