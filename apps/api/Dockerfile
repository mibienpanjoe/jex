FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget openssl \
  && addgroup -S jex && adduser -S jex -G jex
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
RUN npx prisma generate \
  && chown -R jex:jex /app
USER jex
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
