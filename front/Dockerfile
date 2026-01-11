FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["node", "server.js"]
