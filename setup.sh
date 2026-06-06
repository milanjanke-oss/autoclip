#!/bin/bash
set -e

echo ""
echo "=== AutoClip Server Setup ==="
echo ""

# Docker installieren falls nicht vorhanden
if ! command -v docker &> /dev/null; then
  echo ">> Docker wird installiert..."
  curl -fsSL https://get.docker.com | sh
  echo ">> Docker installiert."
fi

# Repo klonen oder updaten
if [ -d "autoclip" ]; then
  echo ">> Repo bereits vorhanden — Update wird durchgefuehrt..."
  cd autoclip
  git pull
else
  echo ">> Repo wird geklont..."
  git clone https://github.com/milanjanke-oss/autoclip.git
  cd autoclip
fi

# .env erstellen falls noch nicht vorhanden
if [ ! -f ".env" ]; then
  echo ""
  echo ">> .env wird erstellt..."
  read -p "Groq API Key (gsk_...): " GROQ_KEY
  read -p "Pexels API Key (optional, Enter zum Ueberspringen): " PEXELS_KEY
  read -p "Zugangscode fuer die App (schuetzt vor fremdem Zugriff): " ACCESS
  SERVER_IP=$(curl -s ifconfig.me)

  cat > .env << EOF
GROQ_API_KEY=${GROQ_KEY}
PEXELS_API_KEY=${PEXELS_KEY}
ACCESS_CODE=${ACCESS}
FRONTEND_URL=http://${SERVER_IP}
PORT=4000
NODE_ENV=production
EOF
  echo ">> .env erstellt (Server-IP: ${SERVER_IP})"
else
  echo ">> .env bereits vorhanden — wird nicht ueberschrieben."
fi

echo ""
echo ">> App wird gebaut und gestartet (kann 2-3 Min dauern)..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo ""
SERVER_IP=$(curl -s ifconfig.me)
echo "========================================="
echo "  AutoClip laeuft auf: http://${SERVER_IP}"
echo "========================================="
echo ""
