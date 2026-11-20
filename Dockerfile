# syntax=docker/dockerfile:1
# Multi-stage build: Next.js static export, served by an unprivileged nginx.
# Base images are pinned by digest; Dependabot (docker ecosystem) bumps them.

# ---- Stage 1: build the static export (out/) ------------------------------
FROM node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# --ignore-scripts: no post-install hook is needed and none should run in CI.
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx (non-root, port 8080) ----------------------
FROM nginxinc/nginx-unprivileged:alpine-slim@sha256:a8cb0f33d51fa107c96fd2bd3a71aaf564ec131e9d2bdf8700944f0ed8b170d7

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
