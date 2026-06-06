# @dlmj Budget-Content-Workflow

## Konzept
Milan = A-Roll (Green Screen, Halbkörper, Hände sichtbar)
Remotion = B-Roll (Text-Animationen, Stock-Videos, Screen-Recordings, Motion Graphics)
CapCut = Finaler Schnitt

---

## Format-Strategie

| Format | Länge | Ziel | Frequenz |
|--------|-------|------|----------|
| Viral-Hook | <20 Sek | Reichweite | 2x/Woche |
| Tutorial | 60–90 Sek | TikTok-Monetarisierung + Leads | 1x/Woche |

---

## Skript-Templates

### Tutorial (>1 Min)
```
[0–3 Sek]  HOOK         — Provokante These, Milan direkt in die Kamera
[3–10 Sek] PROBLEM      — "Die meisten machen X so..." → B-Roll: BRollTextStats
[10–50 Sek] LÖSUNG      — Step-by-step → B-Roll: BRollScreen (Tool-Demo)
[50–60 Sek] ERGEBNIS    — Zahl/ROI → B-Roll: BRollMotion (counter/before-after)
[60–65 Sek] CTA         — "Follow für mehr KI-Content" → Milan direkt
```

### Viral-Hook (<20 Sek)
```
[0–2 Sek]  HOOK-TEXT (Einblendung) + Milan
[2–15 Sek] KERN-AUSSAGE — max. 1 Text-Einblendung
[15–20 Sek] CLIFFHANGER oder CTA
```

---

## B-Roll-Typen

### 1. BRollTextStats — Animierte Text/Stats
```bash
./scripts/render-broll.sh BRollTextStats '{
  "title": "KI spart Zeit",
  "bullets": ["Kein manuelles Tippen", "Sofort einsatzbereit"],
  "stat": {"value": 80, "label": "Zeitersparnis/Woche", "suffix": "%"},
  "variant": "dark",
  "durationMs": 4000
}'
```
Varianten: `"dark"` | `"light"` | `"brand"` (gelber Hintergrund)

### 2. BRollPexels — Stock-Video (Pexels)
1. Video-URL von Pexels herunterladen → nach `public/broll/` kopieren
```bash
./scripts/render-broll.sh BRollPexels '{
  "videoUrl": "./public/broll/office.mp4",
  "overlayText": "So arbeiten Unternehmer 2025",
  "overlayPosition": "bottom",
  "durationMs": 5000
}'
```

### 3. BRollScreen — Screen-Recording
1. Screen-Recording als .mp4 nach `public/broll/` kopieren
```bash
./scripts/render-broll.sh BRollScreen '{
  "screenSrc": "./public/broll/demo.mp4",
  "label": "Live Demo",
  "durationMs": 6000
}'
```
Optional: `"zoomTarget": {"x": 0.5, "y": 0.3, "scale": 1.8, "startMs": 2000}` für Zoom-Effekt

### 4. BRollMotion — Motion Graphics
```bash
# Before/After
./scripts/render-broll.sh BRollMotion '{"variant":"before-after","before":"2h E-Mails schreiben","after":"3 Min mit KI","durationMs":5000}'

# Counter
./scripts/render-broll.sh BRollMotion '{"variant":"counter","value":80,"label":"Zeitersparnis","suffix":"%","durationMs":4000}'

# Progress-Bar
./scripts/render-broll.sh BRollMotion '{"variant":"progress","label":"Prozesse automatisiert","percentage":75,"subLabel":"von 4 Mitarbeitern","durationMs":5000}'

# Arrow-Flow (Steps)
./scripts/render-broll.sh BRollMotion '{"variant":"arrow-flow","steps":["Skript schreiben","B-Roll rendern","CapCut schneiden"],"durationMs":5000}'
```

### 5. BRollQuestion — Instagram Q&A Karte
```bash
./scripts/render-broll.sh BRollQuestion '{
  "question": "Wie fange ich mit KI im Betrieb an?",
  "asker": "max_muster",
  "durationMs": 5000
}'
```
Instagram-Stil: lila Gradient-Header + weiße Karte, Frage erscheint animiert.

---

## Portrait-Workflow (Sandwich-Effekt — OHNE Green Screen)

Person wird per KI ausgeschnitten und zwischen Hintergrund-Design und Text gesetzt.
Kein CapCut nötig — ein Befehl, fertig.

```bash
cd /Users/milanjanke7/Documents/DLMJ/projekte/AutoClip/remotion

# Standard (Orange + Cyan + Claude-Logo):
./scripts/render-portrait.sh ~/Desktop/mein_video.mp4 "FÜR" "CLAUDE" "die du kennen musst"

# Eigene Farben:
./scripts/render-portrait.sh ~/Desktop/video.mp4 "DIE" "AUTOMATISIERUNG" "die alles verändert" "#1a1a1a" "#FFE600"
```

**Output:** `exports/hook/[name]_portrait_[timestamp].mp4`
**Render-Zeit:** ~3–4 Min für 12 Sek Video

**Tipps für beste Ergebnisse:**
- Indoor aufnehmen, einfarbiger/neutraler Hintergrund bevorzugt
- Gleichmäßiges Licht — kein Gegenlicht
- Halbkörper (Bauch aufwärts), Hände im Frame

---

## Keyword-CTA Caption-Template

```
[Tool/Automatisierung/Thema] 🚀
Für [was sie bekommen] schreib „[KEYWORD]" in die Kommentare 👇

[Konkretes Unternehmer-Problem in 1 Satz]
• [Was das löst — Bullet 1]
• [Was das löst — Bullet 2]
• [Was das löst — Bullet 3]
[ROI-Zahl oder Zeitersparnis]

Schreib „[KEYWORD]" — ich schick dir alles direkt.
#ki #automatisierung #kmu #unternehmertum #aibusiness
```

**Bewährt:** Sebastian Kauffmann Tag 111 → 1.400 Kommentare mit diesem Format.
**Funktionsweise:** Jeder Kommentar = Algorithmus-Signal + Follower landet in DM-Funnel.

---

## Q&A Reel Format

1. Instagram Story → Fragen-Sticker setzen: „Eure KI-Fragen"
2. Beste Frage auswählen
3. BRollQuestion rendern (Fragen-Karte als B-Roll)
4. Tutorial-Format 30–60 Sek: Frage einblenden → Milan antwortet

---

## CapCut-Workflow

1. B-Roll-Clips in `exports/broll/` sammeln
2. CapCut: B-Roll-Clips in Timeline (Hauptvideo)
3. Milan A-Roll darüber → Background Remover (Green Screen)
4. Milan: 50–60% Bildbreite, leicht seitlich positioniert
5. Auto-Caption oder manuell
6. Hook-Text: erste 2 Sek als Text-Einblendung
7. Export: 1080×1920, H.264, 30fps

### Green Screen Setup
- Halbkörper (Bauch aufwärts), Hände sichtbar und in Bewegung
- Feste Kamera auf Stativ
- Gleichmäßige Beleuchtung des Green Screens (keine Schatten)
- Milan leicht rechts oder links positionieren, nicht zentriert

---

## Content-Pillars @dlmj

| Pillar | B-Roll-Typ | Format |
|--------|-----------|--------|
| KI-Demo | BRollScreen | Tutorial >1 Min |
| Vorher/Nachher | BRollMotion before-after | Tutorial oder Hook |
| Vibe-Coding-Tipp | BRollScreen | Tutorial >1 Min (Donnerstag) |
| ROI-Story | BRollMotion counter | Hook <20 Sek |
| Provocations-Hook | Kein B-Roll | Hook <20 Sek |

---

## Remotion Studio öffnen
```bash
cd /Users/milanjanke7/Documents/DLMJ/projekte/AutoClip/remotion
npm run dev
```
Alle Kompositionen im Studio: `ShortVideo`, `BRollTextStats`, `BRollPexels`, `BRollScreen`, `BRollMotion`, `BRollQuestion`, `VideoHookFrame`, `VideoPortraitFrame`

---

## Checkliste: Video in einem Tag produzieren

### Vorbereitung (15 Min)
- [ ] Thema + Keyword für CTA festlegen
- [ ] Skript-Template wählen (Hook <20s oder Tutorial >1 Min)
- [ ] B-Roll-Typ bestimmen (TextStats / Motion / Screen / Portrait)

### Aufnahme A-Roll (20 Min)
- [ ] Kamera auf Stativ, Halbkörper, Hände sichtbar
- [ ] Gleichmäßiges Licht, neutraler Hintergrund (für Portrait-Workflow)
- [ ] 2–3 Takes, bester auswählen

### B-Roll Rendern (10 Min)
- [ ] `cd /Users/milanjanke7/Documents/DLMJ/projekte/AutoClip/remotion`
- [ ] Gewünschten `render-broll.sh` Befehl ausführen
- [ ] ODER `render-portrait.sh` für Sandwich-Effekt (kein CapCut Green Screen nötig)

### CapCut Schnitt (20 Min, nur bei normalem Green-Screen-Workflow)
- [ ] B-Roll-Clips in Timeline
- [ ] Milan A-Roll darüber, Background Remover
- [ ] Caption, Hook-Text, Export 1080×1920

### Veröffentlichung (5 Min)
- [ ] Caption mit Keyword-CTA einfügen (Template oben)
- [ ] Hashtags: `#ki #automatisierung #kmu #unternehmertum #aibusiness`
- [ ] TikTok + Instagram Reels posten
