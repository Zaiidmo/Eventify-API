# FROM node:20.7.0

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD [ "npm", "run", "start" ]

# -------------------------------------------------------
# Base image (pin to the current version)
# -------------------------------------------------------
FROM node:20.7.0 AS base
WORKDIR /usr/src/app

# -------------------------------------------------------
# Dev stage (keeps the old behavior, uses ts-node/nest)
# -------------------------------------------------------
FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm","run","start:dev"]

# -------------------------------------------------------
# Build stage (compile to dist/, then prune dev deps)
# -------------------------------------------------------
FROM base AS build
COPY package*.json ./
# Keep devDependencies for the build (nest/tsc)
RUN npm ci
COPY . .
RUN npm run build \
 && npm prune --omit=dev

# -------------------------------------------------------
# Production runtime (small, stable, Railway-friendly)
# -------------------------------------------------------
FROM node:20.7.0 AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Cap heap to avoid OOM on free tiers
ENV NODE_OPTIONS="--max-old-space-size=256"

# Install only runtime deps
COPY package*.json ./
RUN npm ci --omit=dev

# Bring compiled app
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
# Same path Railway tried to run; now it exists.
CMD ["node","dist/main.js"]
