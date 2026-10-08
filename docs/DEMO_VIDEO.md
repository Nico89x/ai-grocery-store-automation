# Echte Demo-Aufnahme

[Video ansehen](https://nico89x.github.io/ai-grocery-store-automation/demo.mp4) oder in der Live-App die Rubrik **Kurze Demo-Aufnahme ansehen** öffnen.

Die Aufnahme zeigt die tatsächlich gerenderte Anwendung: Außenansicht, Innenraum, Produktdetails, Warenkorb, Chips-Kauf mit Lagerwarnung, Fehler bei einem Wasserkauf, Retry und animierte Kund:innen. Kein Ton; deutsche WebVTT-Untertitel sind im eingebetteten Player aktivierbar. Es wurden keine Erfolgswerte nachträglich eingesetzt.

Das Original wurde mit Playwright bei 1440 × 1000 Pixeln und 25 Bildern/s aufgenommen. Die ersten sieben Sekunden der Ladephase wurden abgeschnitten. Der H.264-Export dauert **49,72 Sekunden**, ist ungefähr 2,3 MB groß und verwendet Faststart. Der Player lädt das Video erst bei Nutzung, nicht beim Öffnen der Simulation.

## Aufnahme reproduzieren

Nach Installation der Projektabhängigkeiten:

```bash
pnpm exec playwright install chromium
pnpm dev --port 4173
# In einem zweiten Terminal:
pnpm demo:record
ffmpeg -ss 7 -i work/video/demo-source.webm -c:v libx264 -preset fast -crf 27 -pix_fmt yuv420p -movflags +faststart -an public/demo.mp4
```

FFmpeg ist nur für den Videoexport erforderlich, nicht zum Starten der App. `DEMO_URL` kann die Aufnahme auf eine andere lokale URL richten. Ladezeit und Schrittdauer können je nach Gerät abweichen; Schnittpunkt und Untertitel dann anhand der neuen Aufnahme anpassen.
