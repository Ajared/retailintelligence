FROM node:23.11.0-alpine as builder
ENV NODE_ENV=build
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

RUN pnpm prune --prod

FROM node:23.11.0-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["pnpm", "start:prod"]