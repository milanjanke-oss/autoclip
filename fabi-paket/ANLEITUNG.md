# DLMJ Content Factory — Tägliche Anleitung für Fabi

---

## Überblick: 3 Video-Typen

| Typ | Script | Wann nutzen |
|---|---|---|
| **Portrait** | `render-portrait.sh` | Milan vor einfarbigem Hintergrund + KI schneidet ihn aus |
| **Hook** | `render-hook.sh` | Milan-Video mit gestaltetem Hintergrund-Block oben |
| **B-Roll** | `render-broll.sh` | Animierte Grafiken ohne Person (Statistiken, Vor/Nachher, etc.) |

---

## Workflow pro Video

1. Milan schickt dir ein Video (MP4, idealerweise 4K oder 1080p)
2. Lege das Video irgendwo auf deinem Computer ab (z.B. Desktop)
3. Öffne **Terminal (Mac)** oder **Git Bash (Windows)**
4. Navigiere in diesen Ordner: `cd /pfad/zu/fabi-paket`
5. Führe das passende Script aus (siehe unten)
6. Das fertige Video landet in `exports/portrait/` oder `exports/broll/`
7. Schick das fertige Video an Milan

---

## Portrait-Video (Hauptformat)

KI entfernt Milans Hintergrund automatisch, du wählst Hintergrundfarbe, Text und Icon.

```bash
./scripts/render-portrait.sh <video> "<LINE1>" "<LINE2>" "<line3>" "<bgColor>" "<accentColor>" "<icon>"
```

**Einfachstes Beispiel** (Standard-Farben, Claude-Logo):
```bash
./scripts/render-portrait.sh ~/Desktop/milan_video.mp4 "FÜR" "CLAUDE" "die du kennen musst"
```

**Mit eigenen Farben und Icon:**
```bash
./scripts/render-portrait.sh ~/Desktop/milan_video.mp4 "DIE" "KI-TOOLS" "die alles verändern" "#1a1a1a" "#FFE600" "bolt"
```

### Alle Parameter erklärt

| Parameter | Beispiel | Bedeutung |
|---|---|---|
| `<video>` | `~/Desktop/milan.mp4` | Pfad zu Milans Video-Datei |
| `LINE1` | `"FÜR"` | Kleine Zeile oben (Uppercase automatisch) |
| `LINE2` | `"CLAUDE"` | Große Hauptzeile (fett, in Akzentfarbe) |
| `line3` | `"die du kennen musst"` | Kleine kursive Zeile unten |
| `bgColor` | `"#1a1a1a"` | Hintergrundfarbe als Hex-Code |
| `accentColor` | `"#FFE600"` | Farbe der Hauptzeile als Hex-Code |
| `icon` | `"cloud"` | Symbol im Hintergrund (siehe ICONS.md) |

**Render-Dauer:** ca. 3–5 Minuten pro Video (KI + Rendering)

---

## Hook-Video

Milans Video mit gestaltetem Hintergrund-Block (ohne KI-Ausschnitt).

```bash
./scripts/render-hook.sh <video> "<LINE1>" "<LINE2>" "<line3>" "<bgColor>" "<accentColor>"
```

**Beispiel:**
```bash
./scripts/render-hook.sh ~/Desktop/milan_video.mp4 "SO" "SPARST DU" "3 Stunden täglich"
```

**Render-Dauer:** ca. 1–2 Minuten

---

## B-Roll Videos (ohne Person)

Animierte Grafiken für Zwischenschnitte.

```bash
./scripts/render-broll.sh <KompositionsName> '<Props als JSON>'
```

### Statistik-Grafik

```bash
./scripts/render-broll.sh BRollTextStats '{"title":"KI spart täglich","bullets":["Weniger manuelle Arbeit","Schnellere Antworten","24/7 verfügbar"],"stat":{"value":3,"label":"Stunden gespart","suffix":"h"},"variant":"dark"}'
```

Varianten: `"dark"` (schwarz), `"light"` (weiß), `"brand"` (gelb)

### Vorher/Nachher

```bash
./scripts/render-broll.sh BRollMotion '{"variant":"before-after","before":"2h manuell","after":"3 Min KI"}'
```

### Zähler (Count-up)

```bash
./scripts/render-broll.sh BRollMotion '{"variant":"counter","value":80,"label":"Zeitersparnis","suffix":"%"}'
```

### Schritte/Pfeile

```bash
./scripts/render-broll.sh BRollMotion '{"variant":"arrow-flow","steps":["Skript schreiben","B-Roll rendern","CapCut Schnitt"]}'
```

### Instagram-Frage-Karte

```bash
./scripts/render-broll.sh BRollQuestion '{"question":"Wie fange ich mit KI an?","asker":"max_muster"}'
```

---

## Farb-Referenz

| Name | Hex-Code | Passt zu |
|---|---|---|
| DLMJ Orange | `#C4714A` | Standard-Hintergrund |
| Fast-Schwarz | `#1a1a1a` | Professionell, dunkel |
| Weiß | `#ffffff` | Klar, clean |
| DLMJ Gelb | `#FFE600` | Akzentfarbe auf Dunkel |
| Türkis | `#4DD9D9` | Akzent auf Orange |
| Tiefblau | `#0d1b2a` | Seriös, Tech |
| Mintgrün | `#00C896` | Frisch, modern |

---

## Output-Ordner

- Portrait-Videos: `exports/portrait/`
- Hook-Videos: `exports/hook/`
- B-Roll-Clips: `exports/broll/`

---

## Wenn etwas nicht klappt

| Fehler | Lösung |
|---|---|
| `ModuleNotFoundError: rembg` | `pip install -r requirements.txt` nochmal ausführen |
| Video wird nicht gefunden | Pfad korrekt? Anführungszeichen vergessen? |
| Schwarzes Output-Video | Video-Datei defekt oder falsche Kodierung |
| Script hängt bei Schritt 2/3 | Normal — KI braucht 2-4 Min, warten |
