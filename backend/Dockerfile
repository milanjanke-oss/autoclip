FROM node:22-slim

RUN apt-get update && apt-get install -y \
  ffmpeg \
  chromium \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Manifeste zuerst → Docker-Layer-Cache für npm ci (Build-Context = Repo-Root)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY remotion/package.json ./remotion/package.json
RUN npm ci --workspace=backend --workspace=remotion --include-workspace-root

COPY backend ./backend
COPY remotion ./remotion
RUN npm run build --workspace=backend

RUN mkdir -p /app/backend/uploads
EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
