# Hintergrund-Icons — Übersicht

Beim Portrait-Video (Parameter 7) kannst du das Symbol im Hintergrund wählen.
Das Symbol erscheint groß und transparent hinter Milan — nicht zu aufdringlich.

---

## Verfügbare Icons

| Keyword | Symbol | Wann nutzen |
|---|---|---|
| `claude` | Strahlenkranz mit C (Standard) | KI-Themen, Claude, Technologie |
| `cloud` | Wolke | SaaS, Cloud-Tools, Software |
| `bolt` | Blitz | Geschwindigkeit, Automatisierung, Power |
| `star` | Fünfzackiger Stern | Premium, Qualität, Bewertungen |
| `spark` | 4-Zacken-Diamant mit kleinen Funkeln | Innovation, KI, Magie |
| `none` | Kein Symbol | Nur Hintergrundfarbe, cleaner Look |

---

## Beispiel-Befehle

```bash
# Claude-Logo (Standard, kann auch weggelassen werden)
./scripts/render-portrait.sh ~/Desktop/video.mp4 "FÜR" "CLAUDE" "die du kennen musst" "#C4714A" "#4DD9D9" "claude"

# Wolke — für Cloud/Software-Videos
./scripts/render-portrait.sh ~/Desktop/video.mp4 "DIESE" "TOOLS" "nutze ich täglich" "#0d1b2a" "#00C896" "cloud"

# Blitz — für Automatisierungs-Videos
./scripts/render-portrait.sh ~/Desktop/video.mp4 "SO" "AUTOMATISIERST" "du deinen Alltag" "#1a1a1a" "#FFE600" "bolt"

# Stern — für Empfehlungs-Videos
./scripts/render-portrait.sh ~/Desktop/video.mp4 "DIE" "BESTEN" "KI-Tools 2025" "#1a1a2e" "#FFE600" "star"

# Spark — für Innovations-Videos
./scripts/render-portrait.sh ~/Desktop/video.mp4 "KI" "VERÄNDERT" "alles" "#C4714A" "#ffffff" "spark"

# Kein Symbol — cleaner Look mit Farbe
./scripts/render-portrait.sh ~/Desktop/video.mp4 "NUR" "FARBE" "kein Schnickschnack" "#ffffff" "#1a1a1a" "none"
```

---

## Tipp: Farbe + Icon kombinieren

| Icon | Empfohlene bgColor | Empfohlene accentColor |
|---|---|---|
| `claude` | `#C4714A` (orange) | `#4DD9D9` (türkis) |
| `cloud` | `#0d1b2a` (dunkelblau) | `#00C896` (mintgrün) |
| `bolt` | `#1a1a1a` (schwarz) | `#FFE600` (gelb) |
| `star` | `#1a1a2e` (dunkel) | `#FFE600` (gelb) |
| `spark` | `#C4714A` (orange) | `#ffffff` (weiß) |
| `none` | `#ffffff` (weiß) | `#1a1a1a` (schwarz) |
