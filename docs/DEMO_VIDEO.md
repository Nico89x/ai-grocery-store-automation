# Echte Demo-Aufnahme

[Video ansehen](https://nico89x.github.io/ai-grocery-store-automation/demo.mp4) oder in der Live-App die Rubrik **Kurze Demo-Aufnahme ansehen** öffnen.

Die Aufnahme zeigt die tatsächlich gerenderte Anwendung: Außenansicht, Innenraum, Produktdetails, Warenkorb, Chips-Kauf mit Lagerwarnung, Fehler bei einem Wasserkauf, Retry und animierte Kund:innen. Kein Ton; deutsche WebVTT-Untertitel sind im eingebetteten Player aktivierbar. Es wurden keine Erfolgswerte nachträglich eingesetzt.

Die aktuelle Aufnahme vom 12. Oktober 2026 wurde mit Playwright bei 1440 × 1000 Pixeln und 25 Bildern/s aufgenommen. Der ungekürzte H.264-Export dauert **45,36 Sekunden**, ist **3.685.304 Bytes** groß und verwendet Faststart. Der Player lädt das Video erst bei Nutzung, nicht beim Öffnen der Simulation. Die Aufnahme enthält die neuen texturierten Menschen, einschließlich Figurenwechsel.

## Aufnahme reproduzieren

Nach Installation der Projektabhängigkeiten:

```bash
pnpm exec playwright install chromium
pnpm build
pnpm demo:record
ffmpeg -y -i work/video/demo-source.webm -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p -movflags +faststart -an public/demo.mp4
pnpm build
```

FFmpeg ist nur für den Videoexport erforderlich, nicht zum Starten der App. Ohne laufende Vorschau startet und beendet das Skript selbst den Produktionsserver auf Port 4175. `DEMO_URL` kann die Aufnahme auf eine andere laufende lokale URL richten. Das Skript prüft die gezeigten Kauf-/Retry-Ergebnisse sowie Browserfehler und erzeugt Screenshots, Kapitelzeiten und deutsche Untertitel aus den tatsächlich gemessenen Zeiten. Bei einer neuen Aufnahme können Ladezeit und Schrittdauer je nach Gerät abweichen; der Export benötigt keinen festen Schnittpunkt.
