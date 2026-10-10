# syntax=docker/dockerfile:1
# Multi-stage build: Next.js static export, served by an unprivileged nginx.
# Base images are pinned by digest; Dependabot (docker ecosystem) bumps them.

# ---- Stage 1: build the static export (out/) ------------------------------
FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402 AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# --ignore-scripts: no post-install hook is needed and none should run in CI.
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx (non-root, port 8080) ----------------------
FROM nginxinc/nginx-unprivileged:alpine-slim@sha256:1517d8c358e2e093957ebee087afa9eb19a32f5d7ecb711b7429e369cb998224

# Apply Alpine security updates (the pinned digest may lag behind fixed CVEs
# such as pcre2 10.49). apk needs root; drop back to the image's nginx user.
USER root
RUN apk upgrade --no-cache
USER nginx

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 8080
# The base image already runs as uid 101 and starts nginx in the foreground.
