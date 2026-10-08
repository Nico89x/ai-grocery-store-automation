# Prüfprotokoll – 7. Oktober 2026

Die Prüfung betrifft die lokale Portfolio-Demo. Es wurden keine echten Zahlungen, Bestellungen, Benachrichtigungen oder externen Webhooks ausgelöst.

## Automatische Prüfung

- `pnpm build`: TypeScript-Prüfung und Vite-Produktionsbuild erfolgreich.
- `pnpm test`: **9 Tests bestanden**.
- Die Tests decken Cent-Summen, ganze Mengen, Mengenbegrenzung, sechs erfolgreiche Events, Lagerwarnung, Retry ohne doppelte Buchung, konkurrierende Bestellungen ohne negative Bestände oder Teilbuchung, bedingte Warnungen, Kundenbestellungen, Reset und Webhook-Adapter ab.
- Der Webhook-Adapter wurde ohne URL, mit fehlschlagendem und mit erfolgreichem simuliertem Transport geprüft. Kein echter n8n-Endpunkt ist konfiguriert.

## Prüfung im Browser

- Startansicht und Start-/Pause-Steuerung funktionieren.
- Ein im 3D-Raum verankertes Kesselchips-Etikett öffnet die korrekten Produktdetails.
- Hinzufügen, Mengenerhöhung auf zwei Packungen (**4,98 €**), Reduzierung auf eine Packung (**2,49 €**) und Entfernen funktionieren.
- Ein manueller Kauf reduziert den Chips-Bestand **4 → 3**. Genau eine Lagerwarnung entsteht. Alle sechs Workflow-Ereignisse schließen erfolgreich mit Zeitstempel ab.
- Testfehler bei einem weiteren Kauf: Mineralwasser **15 → 14**, Abschluss fehlgeschlagen. Nach Retry: erfolgreich, **weiterhin 14**, Versuch 2.
- Auch der mobile Chips-Kauf mit Warnung und anschließendem Testfehler wurde wiederholt: Retry behält **3 Chips und genau eine Warnung** bei.
- Automatische Kundenkäufe bei **4×** wurden beobachtet: 36 zusätzliche Käufe erfolgreich, Bestellungen in der Historie, Bestandsreduzierungen korrekt, keine negativen Bestände.
- Die drei NOA-Schnellfragen antworten mit veganen Produkten, den günstigsten verfügbaren Artikeln und dem tatsächlichen Niedrigbestand.
- Drehen per Maus, Zoomen per Scrollrad, WASD-Bewegung sowie Laden-, Übersichts- und Augenhöhenansicht wurden im Browser geprüft.
- Desktopansicht und mobile Ansicht bei **390 × 844 CSS-Pixeln** geprüft: kein horizontaler Überlauf, Produkt- und Warenkorb-Dialoge passen und sind bedienbar.
- Nach dem mobilen Kauf springt die Ansicht an den Anfang des Workflow-Panels.
- Die geprüfte Produktionsansicht hat **keine Konsolenfehler oder Konsolenwarnungen** erzeugt. Ein während der Entwicklung auftretendes Problem mit mehrfachen HTML-Roots in der 3D-Szene wurde durch einen gemeinsamen React-DOM-Overlay-Bereich behoben.

Die 3D-Demo verwendet selbst erstellte Geometrie, Etiketten und Materialtexturen; sie benötigt WebGL. Die Produktliste bietet eine unabhängige Bedienmöglichkeit für die lokale Automation. Eine geräteübergreifende Prüfung auf realen Mobiltelefonen ist nicht Teil dieses lokalen Browsertests.

## Erweiterung: Außenansicht und Eingang

- Neues eigenes Fassadenmodell mit Dach, Schaufenstern, Ladenschild, Vordach, Glastür, Gehweg, Straße, Bäumen, Bank und neutralen Nachbargebäuden.
- Die Szene startet draußen. Vier Kameraansichten, „Laden betreten“, „Nach draußen“ und ein direkter Klick auf die Glastür funktionieren. Außen und auf Augenhöhe ist die Gebäudehülle geschlossen; die Überblicksansichten zeigen den offenen Grundriss.
- Produktauswahl bleibt während des kurzen Kameraflugs gesperrt. Nach dem Wechsel öffnet das Kesselchips-Etikett die korrekten Details.
- Ein Artikel im Warenkorb bleibt beim Wechsel nach draußen erhalten. Ein Kauf aus der Außenansicht reduziert Chips 4 → 3 und schließt alle sechs Ereignisse einschließlich Lagerwarnung erfolgreich ab.
- Fehler und Retry auf der mobilen Ansicht wiederholt: Mineralwasser 15 → 14, Abschluss fehlgeschlagen; nach Retry weiterhin 14 und Versuch 2 erfolgreich.
- Kunden betreten den Laden vom Gehweg durch die automatisch öffnende Tür. Der automatische Kundenkauf reduzierte Orangensaft 10 → 9 und erschien in der gemeinsamen Bestellhistorie.
- Desktop 1440 × 1000 und Mobilansicht 390 × 844 geprüft: vier Ansichtsbuttons passen, Eingang und Bewegungstasten sind erreichbar, kein horizontaler Überlauf.
- Produktionsbuild erneut erfolgreich, alle neun Logiktests bestanden. Keine Konsolenfehler oder Konsolenwarnungen im geprüften Produktionsbrowser.

## Material- und Portfolio-Erweiterung

- Holzmaserung, Stein, Putz und Backwarenkruste werden lokal erzeugt und gemeinsam verwendet. Eine eigene Lichtumgebung sorgt für Glas-/Metallreflexionen ohne externen HDR-Download.
- Geformte Chipstüten, Flaschen mit Schultern, Hals und Verschluss, gebogene Bananen/Croissants, Aluminiumdosen und gefülltere Regale. Positionen auf die tatsächlichen Regalböden korrigiert. Augenhöhenkamera mit weiterem Sichtfeld.
- Produktinfos lassen sich für die Präsentation ausblenden. Ein direkter Klick auf die gelbe 3D-Chipstüte öffnete die korrekten Kesselchips-Details; Kauf und alle sechs Events erfolgreich, Bestand 4 → 3 und genau eine Warnung.
- Zehn automatische Tests bestanden; Produktionsbuild mit TypeScript-Prüfung erfolgreich. Ein zusätzlicher Regressionstest prüft gültige Vertices, Normalen und Bounding Sphere an den verformten Tütenrändern.
- Browser 1440 × 1000 und 390 × 844 geprüft. Die neuen Infobuttons und Kameraansichten passen, kein horizontaler Überlauf. Der bereinigte Produktionsbrowser meldete keine Konsolenfehler oder Warnungen.
- README mit englischem Reviewer-Überblick, Architekturdiagramm, eigenen Screenshots und dokumentierten Entscheidungen. PORTFOLIO.md erklärt Veröffentlichung und Bewerbungspräsentation.
- GitHub-Workflows für Tests/Build und opt-in Pages-Veröffentlichung vorbereitet. Keine GitHub-Veröffentlichung durchgeführt; CI und Deployment sind noch nicht auf GitHub geprüft.
- Erneuter mobiler Testfehler/Retry nach der Material-Erweiterung: Mineralwasser 15 → 14, Abschluss fehlgeschlagen; Retry erfolgreich mit Versuch 2 und unverändertem Bestand 14. Chips bleiben 3, Warnungen bleiben 1.

## Menschlichere Kundendarstellung und Veröffentlichung

- Zwölf automatische Tests bestehen: zusätzlich gemeinsamer Laufweg, Türdurchgang, Kassenabstand und plausible Gehgeschwindigkeit. Produktionsbuild einschließlich TypeScript erfolgreich.
- Eigene artikulierte Kundenmodelle mit Gesicht, Augen, Mund, Frisuren, Fingern, Gelenken, Greifbewegung und Einkaufskorb. Laufzeiten aus Weglänge berechnet; Figuren laufen durch den Eingang und um die Kasse.
- Automatischer Kundenkauf im neuen Browserstand: Orangensaft 10 → 9, Auftrag abgeschlossen.
- Direkter Klick auf die 3D-Chipstüte öffnet Kesselchips. Manueller Kauf: Bestand 4 → 3, eine Warnung, sechs erfolgreiche Events. Testfehler: Wasser 15 → 14, Retry erfolgreich mit Versuch 2 und weiterhin Bestand 14.
- Desktop 1440 × 1000 und mobile Breite 390 × 844 geprüft: kein horizontaler Überlauf, Warenkorb-Dialog bedienbar. Keine Browser-Konsolenfehler oder Warnungen.
- Öffentliches Repository Nico89x/ai-grocery-store-automation erstellt. Pages-Quelle GitHub Actions und ENABLE_PAGES=true eingerichtet; Upload und erster Deployment-Prüflauf werden anschließend ausgeführt.

## Öffentliche Prüfung – 8. Oktober 2026

- Vollständiger Quellcode und eigene Screenshots im öffentlichen Repository https://github.com/Nico89x/ai-grocery-store-automation.
- GitHub-Workflow Tests and production build erfolgreich: https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794156.
- Pages-Build und Deployment erfolgreich: https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37738794197. Öffentliche Demo: https://nico89x.github.io/ai-grocery-store-automation/.
- Öffentliche Startansicht und Ladeninnenraum laden ohne Anmeldung. Direkter Klick auf gelbe 3D-Chipstüte öffnet die korrekten Kesselchips-Details. Demo-Kauf reduziert Bestand 4 → 3; genau eine Warnung und alle sechs Workflow-Schritte erfolgreich.
- Öffentlicher Testfehler: Mineralwasser 15 → 14, Abschluss fehlgeschlagen. Retry erfolgreich mit Versuch 2 und unverändertem Bestand 14.

- Öffentliche Desktopansicht und mobile Breite 390 × 844: kein horizontaler Überlauf, keine Browser-Konsolenfehler oder Warnungen. Drei weitere Kundenkäufe im öffentlichen Browser erfolgreich. Demo-Website und Technologie-Topics gespeichert; Repository im GitHub-Profil angeheftet.

## Ergänzende Prüfung am 8. Oktober 2026

- **14 Logik-/Geometrietests bestanden**, TypeScript und Vite-Produktionsbuild erfolgreich.
- **12 von 12 Playwright-Browserfällen bestanden**, finaler Prüflauf 1,7 Minuten. Desktop 1440 × 1000 und mobile Pixel-7-Ansicht: Warenkorbmengen, Centpreise, Entfernen; Chips 4 → 3 mit einer Warnung und sechs Events; direkter Raycaster-Klick auf die Chips-Packung; Wasserfehler und Retry bei unverändert 14; automatische Kundenbestellung; Außen/Innenkamera, Escape, kein horizontaler Overflow und Reset. Alle Fälle kontrollieren unbehandelte JavaScript-Fehler.
- Der Prüflauf deckte einen überlagerten Fehlerschalter und einen zu engen mobilen Kamerabildwinkel auf. Beides wurde korrigiert; der komplette neue Lauf besteht. Pausierte Szenen rendern bei Bedarf.
- **n8n real geprüft:** Workflow 587gRdtCgS3sm9ln erstellt und aktiviert. Gepinnter Funktionstest 276; echter HTTP-Empfang 277; Demo-Kauf aus dem Browser 278; weiterer HTTP-Prüflauf 279. Zwei ungültige Ereignisse (kein Demo-Flag, falsche Summe) erhalten HTTP 400. Belege: [JSON](docs/n8n-http-verification.json), [Browseransicht](docs/n8n-connected.png). Keine echten Nachrichten, keine zweite Lagerbuchung.
- Echte Aufnahme: 1440 × 1000, 25 fps, H.264/Faststart, 49,72 Sekunden, 2.241.150 Bytes, ohne Ton. Deutsche Untertitel und ein Poster sind enthalten. Die Ladephase wurde am Anfang um sieben Sekunden gekürzt. Die Aufnahme zeigt echte UI-Zustände.
- Webhook-Ausfall und ungültige Empfangsbelege sind in Adaptertests abgesichert. Die öffentliche Demo startet weiterhin ohne externe URL.

Die alten Prüfeinträge dokumentieren den damaligen Stand; die Zahlen in diesem Abschnitt gelten für das erweiterte Projekt.
