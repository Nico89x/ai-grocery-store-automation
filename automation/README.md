# n8n: echter Testempfang, lokale Lagerbuchung

Der Workflow wurde auf der verbundenen lokalen n8n-Instanz angelegt, aktiviert und mit echten HTTP-POSTs geprüft. Am **12. Oktober 2026** bestätigte die Anwendung nach einem echten Browser-Demo-Kauf **n8n-Ausführung 286**: Chips 4 → 3, eine Lagerwarnung und sechs erfolgreiche lokale Workflow-Schritte. [Browsernachweis](../docs/n8n-connected.png). Die erlaubten lokalen Origins wurden für die aktuelle Vorschau ergänzt und der Workflow erneut veröffentlicht. Frühere synthetische HTTP-Nachweise sind als [Empfangsbeleg](../docs/n8n-success-receipt.json) und [Validierungsprüflauf](../docs/n8n-http-verification.json) dokumentiert; ungültige Demo-Flags und Summen wurden mit HTTP 400 abgewiesen.

## Import und Anschluss

1. In n8n `n8n-workflow.json` importieren und veröffentlichen. Keine Credentials erforderlich.
2. Die von n8n angezeigte Produktions-Webhook-URL verwenden. Auf der hier geprüften Instanz lautet sie `http://localhost:5678/webhook/ai-grocery-portfolio-demo`.
3. In der Demo unter **Lager im Blick → n8n-Testverbindung konfigurieren** diese URL eingeben und **Für nächsten Demo-Kauf aktivieren** drücken. Alternativ `VITE_AUTOMATION_WEBHOOK_URL` in einer nicht eingecheckten `.env.local` setzen und Vite neu starten/builden.
4. Einen neuen Demo-Kauf abschließen. Erst wenn n8n Schema, Bestell-ID, Schlüssel, Summe und Zeitstempel bestätigt, zeigt die Anwendung **Webhook verbunden** samt tatsächlicher Ausführungs-ID.
5. Ohne URL, bei ungültiger Antwort oder Netzwerkausfall funktioniert der vollständige lokale Ablauf weiter.

Die öffentliche GitHub-Pages-Demo kann deine lokale n8n-Instanz nicht für andere Besucher bereitstellen. Sie startet ohne Webhook. Für einen öffentlichen Anschluss braucht n8n eine eigene HTTPS-Adresse. Unter `options.allowedOrigins` die tatsächliche Demo-Origin ergänzen; lokal sind 127.0.0.1 mit den Ports 5173, 4173, 4174, 4175 und 4190 erlaubt. Andere Ports oder localhost als Browseradresse müssen unter allowedOrigins ergänzt werden. Der Export wird nach dem Import bewusst erst durch Veröffentlichen aktiviert.

## Verarbeitung

Webhook → Payload-/Preisprüfung → simulierte Warnungsdatensätze → Ausführungsbeleg → JSON-Antwort. Ungültige Daten erhalten HTTP 400. Der Workflow prüft bekannte Artikel, eindeutige Positionen, ganzzahlige Mengen, feste Beispielpreise und eine konsistente Gesamtsumme. Zusätzliche Felder werden nicht in die Antwort übernommen.

Die Lagerbuchung ist bereits im lokalen Reducer abgeschlossen. n8n erzeugt **keine zweite Lagerbuchung**, keine E-Mail und keine Slack-Nachricht. Wiederholte POSTs können weitere Empfangsbelege erzeugen; dieser stateless Testempfänger behauptet keine dauerhafte Deduplizierung. Produktive Persistenz und serverseitige Idempotenz sind separate Erweiterungen.

`example-order.json` ist ein direkt sendbares Testereignis. `workflow-sdk.txt` dokumentiert die mit dem offiziellen n8n-SDK validierte Konstruktion. Der JSON-Export bleibt unabhängig vom SDK importierbar.
