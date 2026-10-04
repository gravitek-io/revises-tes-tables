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
FROM nginxinc/nginx-unprivileged:alpine-slim@sha256:c81a27f28bc2d9c2da8998444e653c7b85b9bbbaa92e44ef18d8920784e06507

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 8080
# The base image already runs as uid 101 and starts nginx in the foreground.
