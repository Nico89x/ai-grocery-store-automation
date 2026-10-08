# Projektstudie: AI Grocery Store Automation

[Live ausprobieren](https://nico89x.github.io/ai-grocery-store-automation/) · [Quellcode](https://github.com/Nico89x/ai-grocery-store-automation) · [Demo-Video](https://nico89x.github.io/ai-grocery-store-automation/demo.mp4)

## Ausgangspunkt

Eine Automation ist in einem Portfolio schwer einzuschätzen, wenn nur ein Workflow-Diagramm gezeigt wird. Dieses Projekt macht Eingangsdaten, Verarbeitung und Ergebnis unmittelbar erlebbar: Ein Einkauf im 3D-Laden führt zu einer sichtbaren Bestellung, einer Lagerbuchung und gegebenenfalls einer Warnung.

## Rolle und Arbeitsweise

Nico89x hat Konzept, Zielbild und Anforderungen vorgegeben und die Weiterentwicklung gesteuert. Implementierung, eigene Modelle, Dokumentation und technische Prüfungen wurden mit KI-Unterstützung erstellt. Der veröffentlichte Code und die Prüfnachweise machen die Lösung überprüfbar. Es werden keine handgeschriebene Entwicklungsgeschichte, berufliche Qualifikationen oder nachgewiesenen Geschäftserfolge behauptet.

## Drei Entscheidungen, die sich erklären lassen

**Logik unabhängig von 3D.** Ein reiner Reducer verarbeitet alle Käufe. Die gleiche Transaktion gilt für den Warenkorb und für animierte Kund:innen. Dadurch kann Lagerlogik auch ohne WebGL getestet werden.

**Erfolgreiche Buchung beim Retry behalten.** Der Testfehler entsteht nach der Lagerbuchung. Ein Retry führt den fehlgeschlagenen Abschluss erneut aus, ohne Bestand oder Warnung doppelt zu verändern. Die Queue prüft unmittelbar vor der gemeinsamen Buchung alle Artikel.

**Lokaler Prozess mit nachweisbarem Anschluss.** Die Demo funktioniert ohne Dienste. n8n empfängt optional das abgeschlossene Ereignis, prüft seine Daten und liefert einen echten Ausführungsbeleg. Ein beliebiges HTTP 200 genügt nicht: Antwort und Bestellung müssen zueinander passen.

## Was überprüft werden kann

- Chips kaufen: Bestand 4 → 3, Mindestbestand 4, eine Warnung, sechs erfolgreiche Ereignisse.
- Fehlerschalter aktivieren: Wasser 15 → 14, fehlgeschlagener Abschluss, Retry, weiterhin 14.
- Kund:innen betreten den Laden, wählen Artikel und erzeugen Bestellungen über dieselbe Queue.
- Produktmeshes, Warenkorb, Dialoge und responsive Bedienung werden mit Playwright geprüft.
- Der [n8n-Workflow](../automation/n8n-workflow.json) ist importierbar. [HTTP-Prüfnachweis](n8n-http-verification.json) und [Browser-Nachweis](n8n-connected.png) zeigen echte Verarbeitung ausschließlich synthetischer Daten.

## Umfang und Grenzen

Portfolio-Simulation: keine Zahlungen, keine echten Bestellungen, keine echten E-Mails oder Slack-Nachrichten. NOA antwortet regelbasiert. Der Lagerbestand liegt im Browser-Arbeitsspeicher. Das Projekt enthält keine Produktionsdaten, Accounts oder externen KI-API-Schlüssel.

Geometrie und Materialtexturen sind selbst erzeugt. Natürlichere Proportionen, Stoffstruktur, Gelenke, Gesichter und Produktformen verbessern die Echtzeitdarstellung. Sie bleibt eine stilisierte 3D-Szene und erreicht nicht die Qualität eines fotorealistischen Offline-Renderings.

Der n8n-Empfänger ist ein stateless Testworkflow. Er bestätigt Empfang und Konsistenz, betreibt aber kein dauerhaftes Warenwirtschaftssystem. Die öffentliche Demo nutzt standardmäßig lokale Verarbeitung; eine lokale n8n-Instanz ist nicht automatisch öffentlich erreichbar.

## Nächster sinnvoller Ausbau

Ein eigener Backend-Dienst mit Datenbank und transaktionaler Idempotenz, simuliertem Wareneingang und nachvollziehbaren Nachbestellungen. Geschäftliche Kennzahlen sollten erst nach einer tatsächlich gemessenen Nutzung ergänzt werden.
