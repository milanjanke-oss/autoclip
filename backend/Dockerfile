FROM node:22-slim

RUN apt-get update && apt-get install -y \
  ffmpeg \
  chromium \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

RUN mkdir -p uploads
EXPOSE 4000
CMD ["node", "dist/server.js"]
