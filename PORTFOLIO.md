# Veröffentlichung und Bewerbung

**[Live-Demo](https://nico89x.github.io/ai-grocery-store-automation/#/simulation)** · **[GitHub](https://github.com/Nico89x/ai-grocery-store-automation)** · [Projektstudie](docs/CASE_STUDY.md) · [Vorführleitfaden](docs/INTERVIEW_GUIDE.md)

## Beschreibung für eine Bewerbung

Interaktive 3D-Einkaufsdemo mit React, TypeScript und React Three Fiber. Ein lokaler Ereignisprozessor verbindet Warenkorb, Bestellqueue, Lagerverwaltung und sichtbare Workflow-Logs. Fehler und Retry lassen sich ohne doppelte Lagerbuchung vorführen. Ein optionaler, getesteter n8n-Webhook bestätigt synthetische Bestellereignisse.

Konzept und Anforderungen von Nico89x; Implementierung und technische Prüfungen mit KI-Unterstützung. Lokal gebündelte CC0-Charakterdaten sind separat dokumentiert. Keine Produktionsintegration oder erfundenen Geschäftsergebnisse.

## Veröffentlichungsablauf

1. Änderungen über einen Pull Request prüfen. Nur Quellcode, lokale Laufzeitassets, Dokumentation und echte Nachweise veröffentlichen.
2. CI prüft Formatierung, 17 Tests, TypeScript-/Produktionsbuild und zwölf Browserfälle.
3. Nach Merge auf main veröffentlicht der Pages-Workflow den geprüften Build. Die Repository-Variable ENABLE_PAGES=true aktiviert diesen Schritt.
4. Öffentliche Demo erneut prüfen: Charakterdateien unter dem Repository-Unterpfad, 3D-Produktklick, Warenkorb, Warnung und Retry.
5. Screenshots und Demo-Video müssen den tatsächlich veröffentlichten Stand zeigen. Konkrete Laufnachweise stehen in VERIFICATION.md.

Der lokale Link 127.0.0.1 funktioniert nur auf dem eigenen Gerät. Die öffentliche Demo startet ohne n8n-Endpunkt; für eine externe n8n-Verbindung ist ein separat betriebener HTTPS-Empfänger erforderlich.

## Umfang

Die funktionsfähige Portfolio-Demo benötigt keinen Produktionsserver. Dauerhafte Persistenz, serverseitige Idempotenz, Nachbestellungen und echte Gerätetests bleiben klar benannte Erweiterungen. Code: MIT; MakeHuman-Assetdaten: CC0.
