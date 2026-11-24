# GROC-001 · Veraltete Menge nach Neuladen des Bestands

Fehlerbericht im Jira-Format. Alle Produkt- und Bestelldaten sind synthetisch.

| Feld              | Eintrag                                                        |
| ----------------- | -------------------------------------------------------------- |
| Typ               | Fehler                                                         |
| Priorität         | Mittel                                                         |
| Komponente        | Persistente Bestell-Demo · Mengenwahl                          |
| Umgebung          | Node.js 24 und DOM-Nachbildung, ergänzende SQLite-Backendtests |
| Erfasst           | 23. November 2026                                              |
| Betroffener Stand | `c41d4cd0f9aa`                                                 |
| Status            | Korrigiert und per lokaler Regression geprüft                  |

## Reproduktion

1. Die [persistente Bestell-Demo](../server/README.md) mit frischer SQLite-Datei starten.
2. Im ersten Browserfenster für **Chips milde Paprika** die gesamte verfügbare Menge und für **Dunkle Schokolade 70 %** ein Stück eintragen.
3. Über eine zweite Sitzung ein Stück Paprikachips bestellen. Der automatisierte Test verwendet dafür einen HTTP-Aufruf an `POST /api/orders`.
4. Im ersten Fenster **Daten neu laden** wählen.

**Ist vor der Korrektur.** Die neue Obergrenze wurde angezeigt, die veraltete Eingabe blieb im Mengenfeld. Bei der Testausführung stand im Feld weiterhin `10`, obwohl höchstens `9` verfügbar waren. Der Status meldete lediglich, dass die Daten neu geladen wurden. Die Formularvalidierung konnte das Speichern anschließend blockieren.

**Soll.** Das betroffene Mengenfeld wird geleert und der Status nennt das Produkt, dessen Menge neu gewählt werden muss. Gültige Mengen anderer Produkte bleiben erhalten. Die Demo legt beim Neuladen keine Bestellung an.

**Auswirkung.** Eine inzwischen ungültige Menge kann den Checkout blockieren. Der Anwender kann die Menge manuell korrigieren. Die serverseitige Bestandsprüfung bleibt zuständig für zwischenzeitliche Bestandsänderungen.

**Ursache.** Die Anzeige kopierte beim Neuladen den alten Eingabewert, ohne ihn mit dem neuen Maximum abzugleichen.

## Kleiner Testplan

| Fall  | Prüfung                                                                 | Erwartetes Ergebnis                                                                                      |
| ----- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| QA-01 | Bestand in einer zweiten Sitzung senken und im ersten Fenster neu laden | Neue Obergrenze, betroffenes Feld auf `0`, Produkthinweis im Status                                      |
| QA-02 | Bei QA-01 zusätzlich einen verfügbaren Artikel ausgewählt lassen        | Seine Menge bleibt erhalten. Die nachfolgende Bestellung enthält nur den weiterhin ausgewählten Artikel. |
| QA-03 | Bestehende Tests für Speichern, Wiederholen und Neuladen ausführen      | Derselbe Beleg, keine weitere Bestandsbuchung                                                            |
| QA-04 | Bestehenden Test im mobilen Layout mit leerer Auswahl ausführen         | Kein horizontaler Überlauf, verständlicher Hinweis                                                       |

## Ausführung und Nachweis

Der ausgelieferte Client-Code wurde vor und nach der Korrektur mit einer DOM-Nachbildung sowie einem lokalen HTTP-Server und SQLite ausgeführt. Dabei wurden auch die Wiederholung ohne doppelte Buchung und die Meldung bei leerer Auswahl geprüft. Alle sechs automatisierten Backendtests waren erfolgreich. Der [Playwright-Test](../e2e-backend/orders.spec.ts) ist für die zusätzliche Prüfung im echten Browser Teil der bestehenden CI-Suite.

```sh
pnpm test:e2e:backend
pnpm test:backend
```

Im Playwright-Test verursacht ein synthetischer Bestellaufruf den Bestandswechsel gegen denselben lokalen Server. Für eine Jira-Übernahme können die Felder und Reproduktionsschritte direkt verwendet werden.
