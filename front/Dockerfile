FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite env vars must be set at build time (import.meta.env is replaced during build)
ARG VITE_DEV_AUTH
ARG VITE_API_BASE_URL
ENV VITE_DEV_AUTH=$VITE_DEV_AUTH
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["node", "server.js"]
