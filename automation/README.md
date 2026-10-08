# n8n: echter Testempfang, lokale Lagerbuchung

Der Workflow wurde auf der verbundenen lokalen n8n-Instanz angelegt, aktiviert und mit einem echten HTTP-POST geprüft. Ausführung **277** am 8. Oktober 2026 war erfolgreich; der anonymisierte [Empfangsbeleg](../docs/n8n-success-receipt.json) enthält ausschließlich Beispieldaten. Ein vorheriger gepinnter Funktionstest war Ausführung 276.

## Import und Anschluss

1. In n8n `n8n-workflow.json` importieren und veröffentlichen. Keine Credentials erforderlich.
2. Die von n8n angezeigte Produktions-Webhook-URL verwenden. Auf der hier geprüften Instanz lautet sie `http://localhost:5678/webhook/ai-grocery-portfolio-demo`.
3. In der Demo unter **Lager im Blick → n8n-Testverbindung konfigurieren** diese URL eingeben und **Für nächsten Demo-Kauf aktivieren** drücken. Alternativ `VITE_AUTOMATION_WEBHOOK_URL` in einer nicht eingecheckten `.env.local` setzen und Vite neu starten/builden.
4. Einen neuen Demo-Kauf abschließen. Erst wenn n8n Schema, Bestell-ID, Schlüssel, Summe und Zeitstempel bestätigt, zeigt die Anwendung **Webhook verbunden** samt tatsächlicher Ausführungs-ID.
5. Ohne URL, bei ungültiger Antwort oder Netzwerkausfall funktioniert der vollständige lokale Ablauf weiter.

Die öffentliche GitHub-Pages-Demo kann deine lokale n8n-Instanz nicht für andere Besucher bereitstellen. Sie startet ohne Webhook. Für einen öffentlichen Anschluss braucht n8n eine eigene HTTPS-Adresse. Unter `options.allowedOrigins` die tatsächliche Demo-Origin ergänzen; lokal sind die Prüfports 4173 und 4190 erlaubt.

## Verarbeitung

Webhook → Payload-/Preisprüfung → simulierte Warnungsdatensätze → Ausführungsbeleg → JSON-Antwort. Ungültige Daten erhalten HTTP 400. Der Workflow prüft bekannte Artikel, eindeutige Positionen, ganzzahlige Mengen, feste Beispielpreise und eine konsistente Gesamtsumme. Zusätzliche Felder werden nicht in die Antwort übernommen.

Die Lagerbuchung ist bereits im lokalen Reducer abgeschlossen. n8n erzeugt **keine zweite Lagerbuchung**, keine E-Mail und keine Slack-Nachricht. Wiederholte POSTs können weitere Empfangsbelege erzeugen; dieser stateless Testempfänger behauptet keine dauerhafte Deduplizierung. Produktive Persistenz und serverseitige Idempotenz sind separate Erweiterungen.

`example-order.json` ist ein direkt sendbares Testereignis. `workflow-sdk.txt` dokumentiert die mit dem offiziellen n8n-SDK validierte Konstruktion. Der JSON-Export bleibt unabhängig vom SDK importierbar.
