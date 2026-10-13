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

## Nachprüfung auf dem GitHub-Testrechner

Der erste Linux-CI-Lauf bestand 14 Logiktests und den Produktionsbuild, aber nur neun der zwölf Browserfälle. Kamerafahrten addierten pro Bild höchstens 50 ms, und der Simulator begrenzte verzögerte Takte auf eine Sekunde. Bei langsamer Software-Grafik wurde die Demo dadurch langsamer als die Uhr.

Kamerafahrten nutzen jetzt eine monotone Zeitmessung; Simulationstakte holen bis zu zehn Sekunden in geordneten 250-ms-Schritten nach. Unsichtbare Tabs pausieren die Uhr. Tastatur- und Touchbewegungen fordern auch bei pausierten Kund:innen weitere Bilder an. Ein zusätzlicher Regressionstest vergleicht verzögerte Takte mit regulären Taktfolgen einschließlich Kundenbestellungen und Lagerbuchungen. **15 Logiktests** und der Produktionsbuild bestehen lokal.

## Abschluss: öffentlich geprüfter Portfolio-Ausbau, 8. Oktober 2026

- [PR #1](https://github.com/Nico89x/ai-grocery-store-automation/pull/1) wurde nach erfolgreicher Prüfung zusammengeführt. Getesteter Anwendungscode: `325c0d76844e92f6be262e49ae71fef680787c07`.
- [Hauptbranch-Prüflauf](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37779439241): erfolgreich; 15 Logik-/Adapter-/Geometrietests, Produktionsbuild und alle zwölf Browserfälle. [Pages-Veröffentlichung](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/37779439206): Build und Deployment erfolgreich.
- Der Kunden-Browsertest wählt die erste automatische Bestellung aus. Deren dauerhaftes `inventory.updated`-Ereignis belegt Orangensaft 10 → 9. Der aktuelle Gesamtbestand darf inzwischen weiter gesunken sein, wenn andere Kund:innen ebenfalls Saft kaufen. Der erste CI-Vergleich 9 gegen 8 war eine ungeeignete Annahme über parallele Käufe; die konkrete Buchung wird weiterhin exakt geprüft.
- Auf der tatsächlich veröffentlichten Seite, Desktop 1440 × 1000: echter 3D-Klick auf die Chips-Packung; Produktdetails; Warenkorb 1 → 2 → 1 mit 2,49 / 4,98 / 2,49 Euro; Demo-Kauf; Chips 4 → 3, eine Warnung und alle sechs Ereignisse erfolgreich. Webhook-Modus: lokale Demo-Verarbeitung.
- Mobil 390 × 844: absichtlicher Fehler beim Wasser-Abschluss; Bestand 15 → 14. Retry endet mit Versuch 2 und weiterhin Bestand 14. Kein horizontaler Überlauf.
- Öffentliche Kundenanimationen erzeugten zusätzliche abgeschlossene Bestellungen. Die erste wurde über die Bestellauswahl geprüft: Quelle Kund:in, 1,89 Euro, Saftbuchung −1 auf 9, erfolgreicher Abschluss. Weitere Käufe laufen über dieselbe Bestellqueue.
- Öffentliches Video spielt: Dauer 49,72 Sekunden, deutsche Untertitel vorhanden. Außen-/Innenansicht und neue Figuren sichtbar. Browserkonsole ohne Fehler oder Warnungen.
- Die aktuellen öffentlichen Screenshots sind [Außenansicht](docs/store-exterior.png), [Innenansicht mit Workflow](docs/store-interior.png) und [mobiler Retry](docs/public-mobile.png). Sie zeigen tatsächlich erzeugte UI-Zustände; keine nachträglich eingesetzten Bestellwerte.
- Der reale lokale n8n-Testworkflow ist weiterhin aktiv. Die öffentliche Demo benötigt ihn nicht. Synthetische HTTP-Nachweise und Importdateien bleiben unter `automation/` und `docs/` verfügbar.

Die abschließende Aktualisierung der Markdown-Nachweise und Screenshots verändert keinen Anwendungscode. Die oben verlinkten vollständigen Prüfungen beziehen sich auf den veröffentlichten Anwendungsstand.

## Lokaler Ausbau: texturierte Menschen und Nachbarschaft, 9. Oktober 2026

Dieser Abschnitt beschreibt den lokalen Entwicklungsstand. Die oben verlinkten GitHub-Prüfungen und öffentlichen Screenshots gehören weiterhin zum vorherigen veröffentlichten Stand.

- Drei CC0-MakeHuman-Derivate ersetzen die prozeduralen Figuren: texturierte Haut, Haare, Augen, Kleidung und Schuhe; pro Figur ein eigenes Skelett. Quellen, Lizenz und Konvertierung stehen in THIRD_PARTY_ASSETS.md.
- Menschen-Nahansicht mit Figurenwechsel, Straßenblick, vergrößerbare Szene und separat pausierbares Straßenleben ergänzt. Café-Gäste, Passant:innen, Fahrradfahrer und Fahrzeuge erzeugen keine Bestellungen. Nur die bestehenden Demo-Kund:innen buchen Waren über die Bestellqueue.
- Produktionsbuild erfolgreich. 17 Tests erfolgreich, einschließlich endlicher GLB-Geometrie, normalisierter Skinning-Gewichte, gültiger Knochenindizes, lokaler Texturpfade und eines Downloadbudgets unter 6 MB für die Charakterdateien.
- Alle zwölf vorhandenen Browserfälle liefen nach der Modellintegration erfolgreich durch: Warenkorb, Kauf mit Chips 4 → 3 und Warnung, echter 3D-Packungsklick, Fehler/Retry ohne doppelte Buchung, automatische Kundenbestellung und responsive Bedienung, jeweils auf Desktop und Mobil. Der damalige Windows-Runner wurde nach den zwölf erfolgreichen Fällen beim Aufräumen beendet.
- Die anschließend erweiterten zwei Responsivfälle wurden am 9. Oktober erneut mit Exitcode 0 bestanden: Menschenansicht, zweimaliger Figurenwechsel, keine sichtbare 3D-Fehleransicht, Groß-/Kompaktansicht ohne horizontalen Überlauf, Straßenblick, Straßenleben pausieren/starten, Laden betreten, Produktdialog und Reset. Dabei werden auch Konsolenfehler geprüft. Laufzeit 58,4 Sekunden.
- Ein anfänglicher Testfehler zählte das unsichtbare HTML-Ersatzbild innerhalb des Canvas. Die korrigierte Prüfung sucht sichtbare Fehleransichten. Der lokale Browser zeigte die Modelle und keine Konsolenfehler oder Warnungen.
- Die Modelle sind Echtzeit-Webgrafik mit prozeduralen Bewegungen, kein Motion Capture und kein fotorealistischer Scan. Auf echten Mobilgeräten wurde die Bildrate nicht gemessen.

Damals lokale Vorschau: http://127.0.0.1:4174/#/simulation. Der öffentliche Pages-Stand war bei diesem visuellen Ausbau noch nicht ersetzt.

## Vollständige Portfolio-Prüfung – 12. Oktober 2026

- 17 Logik-, Adapter-, Geometrie- und Charakterdatei-Tests erfolgreich; TypeScript und Vite-Produktionsbuild erfolgreich. Einheitliche Quellcodeformatierung mit Prettier geprüft; CI prüft sie ebenfalls.
- Alle **12 Playwright-Fälle** im vollständigen Lauf erfolgreich, **Exitcode 0**, Laufzeit 2,8 Minuten. Geprüft: Warenkorbmengen/Centpreise/Entfernen, echter 3D-Produktklick, Chips 4 → 3 mit genau einer Warnung und sechs erfolgreichen Ereignissen, Fehler/Retry bei Wasser 15 → 14 ohne zweite Buchung, automatische Kundenbestellung sowie Desktop-/Mobilbedienung einschließlich Menschenansicht, Figurenwechsel, Außen-/Straßenansicht und Reset. Unbehandelte Browser- und Konsolenfehler werden geprüft.
- Neuer synthetischer Kauf aus der laufenden Browser-App an den realen lokalen n8n-Empfänger: **Ausführung 286 bestätigt**, Webhook verbunden. Lagerbuchung und simulierte Benachrichtigung verbleiben im lokalen Simulator; keine echten externen Nachrichten. Nachweis: [n8n-Browseransicht](docs/n8n-connected.png).
- Neue ungekürzte Demo-Aufnahme: **45,36 Sekunden**, 1440 × 1000, 25 fps, H.264/Faststart, **3.685.304 Bytes**. Aufnahme prüft die sichtbaren Kauf-/Retry-Ergebnisse und Browserfehler. Neue Außen-, Menschen- und Innenraum-Screenshots zeigen tatsächlich gerenderte Zustände.
- README, MIT-Lizenz, Beitragsanleitung, Änderungsprotokoll, Architektur-/Projektstudie, Asset-Herkunft und Gesprächsleitfaden ergänzt bzw. aktualisiert. Die Modelle sind CC0-Derivate; die Herkunft wird von der eigenen Ladenszene und Verarbeitungslogik getrennt erläutert.
- Verbleibende Grenzen: Echtzeit-Webgrafik mit prozeduralen Bewegungen; keine fotorealistischen Scans. Mobile Browserbreiten wurden emuliert, die Bildrate auf physischen Mobilgeräten wurde nicht gemessen. Three.js wird verzögert geladen; sein komprimierter Hauptchunk beträgt etwa 355 kB. Die Vite-Größenwarnung wird bewusst nicht unterdrückt.

Der erste neue GitHub-Lauf überschritt auf dem Software-Grafikrechner beim ersten Browserfall das Zeitlimit und wurde beendet. Unsichtbare Charaktermeshes werden jetzt über konservative, bewegungstaugliche Grenzen ausgeblendet. Die Browserfälle verwenden den vorhandenen zugänglichen Einstieg mit reduzierter Bewegung; Straßenleben starten/pausieren und animierte Kundenkäufe werden weiterhin explizit geprüft. Der anschließende vollständige lokale Lauf bestand **alle zwölf Fälle mit Exitcode 0 in 1,6 Minuten**. 17 Fach-/Assettests und der Produktionsbuild bestehen ebenfalls. CI bricht beim ersten endgültigen Fehler ab, protokolliert ihn sofort und hält Trace/Screenshot/Report sieben Tage als Artefakt vor.

Dieser Abschnitt belegt den lokal geprüften Stand. Öffentliche CI-/Deployment-Ergebnisse werden erst nach tatsächlicher Veröffentlichung ergänzt.

### Weitere CI-Diagnose am 12. Oktober

Der [zweite Release-Prüflauf](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/38221726182) bestand Formatierung, 17 Tests, Build und die ersten fünf Desktop-Browserfälle. Der umfangreiche Ansichtswechsel-Fall überschritt zweimal sein Gesamtzeitlimit von 120 Sekunden. Die heruntergeladene Playwright-Spur zeigt langsame erfolgreiche Aktionen: etwa 18 Sekunden für den Beschleunigungsbutton und 43 Sekunden für das Pausieren des Straßenlebens; es wurden keine Fachlogikfehler festgestellt. Sechs Mobilfälle liefen nach dem endgültigen Fehler nicht mehr.

Als Korrektur erkennt der automatische Grafikmodus kleine Bildschirme und Software-Renderer und reduziert dort die Pixeldichte auf 1 sowie dynamische Schatten. Der Modus ist über „Grafikqualität“ sichtbar umschaltbar; er ist keine versteckte Testsonderbehandlung. Der komplexe Ansichtswechsel-Fall erhält 180 Sekunden; das CI-Gesamtbudget beträgt 25 Minuten. Die funktionalen Assertions bleiben bestehen.

Nach dieser Grafikmodus-Korrektur: 17 Tests, TypeScript und Produktionsbuild erfolgreich; kompletter lokaler Desktop-/Mobillauf mit Grafikumschaltung erneut **12/12 erfolgreich, Exitcode 0, 1,6 Minuten**. Formatierungsprüfung erfolgreich. Der zugehörige neue öffentliche CI-Lauf ist separat zu verifizieren.

Der [dritte Release-Lauf](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/38224206395) bestand erneut Formatierung, 17 Tests, Build und fünf Desktopfälle. Der Ansichtswechsel-Fall erreichte beim anschließenden Produktdialog sein Gesamtlimit von 180 Sekunden. Der normale Playwright-Headless-Shell-Browser ersetzt daher den ausdrücklich aktivierten neuen Chromium-Headless-Modus; vollständige Trace-Aufnahmen werden erst bei der ersten Wiederholung aktiviert. Erfolgreiche Fälle behalten alle Assertions ohne kontinuierliche Bildschirmaufzeichnung.

Der vollständige lokale Lauf im regulären Headless-Shell-Browser bestand alle zwölf Fälle mit Exitcode 0 in 7,8 Minuten. Die Kamera-/Dialogprüfung lässt das zuvor erfolgreich gestartete und pausierte Straßenleben für die unabhängige Produktdialog-/Reset-Prüfung pausiert. Dadurch entfällt eine unnötige dauerhafte Grafiklast, ohne Funktionsassertions zu entfernen; automatische Kundenbestellungen bleiben separat mit aktiver Animation geprüft.

Gezielter lokaler Prüflauf nach dieser Teststabilisierung: beide Ansichtswechsel-/Dialogfälle erfolgreich, Exitcode 0; Desktop 54,9 Sekunden, Mobilansicht 38,7 Sekunden. Die übrigen unveränderten Fälle bestanden im zuvor vollständig erfolgreichen 12er-Lauf.

### Freigabeprüfung am 13. Oktober 2026

Der [vierte Release-Prüflauf](https://github.com/Nico89x/ai-grocery-store-automation/actions/runs/38265675784) bestand Formatierung, 17 Tests, Build und fünf Desktopfälle; der noch dauerhaft animierte Ansichtswechsel-Fall überschritt erneut sein Gesamtzeitlimit. Die danach lokal geprüfte Korrektur mit pausierter Nachbarschaft ist im Release-Branch enthalten. Dieser korrigierte Stand wird vor Merge und Veröffentlichung erneut vollständig auf GitHub geprüft.
