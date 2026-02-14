FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm install -g serve

COPY . .

ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

