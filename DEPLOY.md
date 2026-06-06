# AutoClip Deployment (alles auf Hetzner)

Frontend + Backend laufen zusammen auf dem Server. Die Frontend-Nginx (`frontend/nginx.conf`)
liefert die App auf Port 80 aus und leitet `/upload /transcribe /analyze /render /uploads /jobs`
intern an das Backend (`backend:4000`) weiter → same-origin, kein CORS.

## Voraussetzungen
- Hetzner-Server (Ubuntu), Root-/SSH-Zugang
- Groq-API-Key (kostenlos: console.groq.com), optional Pexels-Key
- Selbst gewählter **Zugangscode** (schützt die App)
- Optional, aber für iOS empfohlen: eine Domain/Subdomain (für HTTPS)

## Schritt 1 — (optional) DNS
A-Record der Domain auf die Server-IP zeigen lassen (nötig für HTTPS in Schritt 3).

## Schritt 2 — Repo-Zugang auf dem Server
Repo ist privat. Read-only Deploy-Key einrichten:
```bash
ssh-keygen -t ed25519 -C "hetzner-autoclip" -f ~/.ssh/autoclip -N ""
cat ~/.ssh/autoclip.pub   # → GitHub: Repo > Settings > Deploy keys > Add (read-only)
echo "Host github.com\n  IdentityFile ~/.ssh/autoclip" >> ~/.ssh/config
```
Dann in `setup.sh` die Clone-URL auf SSH stellen: `git@github.com:milanjanke-oss/autoclip.git`.

## Schritt 3 — App starten
```bash
git clone git@github.com:milanjanke-oss/autoclip.git
cd autoclip
bash setup.sh    # fragt Groq-Key, Pexels-Key, Zugangscode ab; baut + startet (2-3 Min)
```
Danach läuft AutoClip auf `http://<Server-IP>` (Port 80).

## Schritt 4 — HTTPS (empfohlen für iOS)
Caddy als Reverse-Proxy mit automatischem Let's-Encrypt-Zertifikat:
```bash
apt install -y caddy
# /etc/caddy/Caddyfile:
#   deine-domain.de {
#       reverse_proxy localhost:80
#   }
systemctl reload caddy
```
Caddy holt das Zertifikat automatisch. App dann unter `https://deine-domain.de`.

> Hinweis: Der Frontend-Container belegt Port 80. Wenn Caddy ebenfalls 80/443 braucht,
> in `docker-compose.prod.yml` das Frontend-Port-Mapping auf `8080:80` ändern und im
> Caddyfile `reverse_proxy localhost:8080` setzen.

## Update einspielen
```bash
cd autoclip && git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Wartung
- Alte Uploads werden automatisch nach 24 h gelöscht (`UPLOAD_TTL_HOURS` in `.env` anpassbar).
- Logs: `docker compose logs -f backend`
- Sicherheit: ohne gesetzten `ACCESS_CODE` warnt das Backend beim Start — Code immer setzen.
