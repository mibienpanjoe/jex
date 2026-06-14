FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r jex && useradd -r -g jex jex
COPY --from=builder --chown=jex:jex /app/.next/standalone ./
COPY --from=builder --chown=jex:jex /app/.next/static ./app/.next/static
COPY --from=builder --chown=jex:jex /app/content ./app/content
COPY --from=builder --chown=jex:jex /app/public ./app/public
USER jex
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXTRA_DEFAULT_LOCALE=fr
ENV NEXTRA_LOCALES='["en","fr"]'
ENV NEXTRA_SHOULD_ADD_LOCALE_TO_LINKS=true
CMD ["node", "app/server.js"]
