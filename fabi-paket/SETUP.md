# DLMJ Content Factory — Einmalige Einrichtung

Dieser Ordner enthält alles um Milans Portrait-Videos automatisch zu schneiden und zu rendern.
**Diesen Setup nur einmal durchführen.**

---

## Was du brauchst

| Programm | Wozu | Download |
|---|---|---|
| Node.js (LTS) | Remotion läuft darauf | https://nodejs.org |
| Python 3.10+ | KI-Hintergrundentfernung | https://python.org |
| Git Bash (nur Windows) | Für die .sh-Scripts | https://gitforwindows.org |

---

## Installation

### Schritt 1 — Node.js installieren
Lade Node.js LTS von https://nodejs.org herunter und installiere es.
Prüfen ob es funktioniert: Terminal öffnen → `node --version` → sollte eine Versionsnummer zeigen.

### Schritt 2 — Python installieren
Lade Python 3.10+ von https://python.org herunter.
**Wichtig (Windows):** Haken bei "Add Python to PATH" setzen!

### Schritt 3 — Diesen Ordner öffnen

**Mac:** Terminal öffnen → in diesen Ordner navigieren:
```bash
cd /pfad/zu/fabi-paket
```

**Windows:** Git Bash öffnen (Rechtsklick auf den Ordner → "Git Bash here")

### Schritt 4 — Node-Pakete installieren
```bash
npm install
```
(Dauert 1-2 Minuten, nur beim ersten Mal)

### Schritt 5 — Python-Pakete installieren
```bash
pip install -r requirements.txt
```
(Dauert 3-5 Minuten, lädt das KI-Modell herunter)

### Schritt 6 — Scripts ausführbar machen (nur Mac)
```bash
chmod +x scripts/*.sh
```

---

## Prüfen ob alles funktioniert

```bash
node --version      # z.B. v20.11.0
python3 --version   # z.B. Python 3.11.4
npm list remotion   # zeigt Remotion-Version
```

---

## Häufige Probleme

| Problem | Lösung |
|---|---|
| `python3: command not found` | Python installiert? Windows: `python` statt `python3` versuchen |
| `npm: command not found` | Node.js installiert? Terminal neu starten |
| `permission denied` auf Mac | `chmod +x scripts/*.sh` ausführen |
| Windows: `.sh` öffnet Notepad | Git Bash nutzen, nicht Windows CMD |
