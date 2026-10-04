#!/usr/bin/env bash
# Smoke-test a running instance of the static site.
#
# Usage: scripts/smoke-test.sh <base-url>
#   e.g. scripts/smoke-test.sh http://localhost:8080
#        scripts/smoke-test.sh https://revises-tes-tables.gravitek.io
#
# Checks the behaviours a visitor depends on: health endpoint, pages with and
# without trailing slash (the sitemap links without it), 404 handling, cache
# and security headers. Exit code 0 on success, 1 on the first failure.
#
# SMOKE_RETRIES overrides the number of 5-second readiness retries, default 12.
set -euo pipefail

BASE="${1:?usage: $0 <base-url>}"
BASE="${BASE%/}"
RETRIES="${SMOKE_RETRIES:-12}"

HEADERS="$(mktemp)"
trap 'rm -f "$HEADERS"' EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
ok()   { echo "ok    $*"; }

# Perform a GET, store status in STATUS and response headers in $HEADERS.
req() {
  STATUS="$(curl -sS -o /dev/null -D "$HEADERS" -w '%{http_code}' "$BASE$1")"
}

# Print the value of a response header (case-insensitive), empty if absent.
header() {
  grep -i "^$1:" "$HEADERS" | tr -d '\r' | cut -d' ' -f2- || true
}

# Wait for the server: container start locally, cold start on Scaleway.
curl -fsS --retry "$RETRIES" --retry-delay 5 --retry-all-errors -o /dev/null "$BASE/healthz" \
  || fail "/healthz not reachable at $BASE"
ok "/healthz reachable"

req /healthz
[ "$STATUS" = "200" ] || fail "/healthz returned $STATUS"
ok "/healthz 200"

req /
[ "$STATUS" = "200" ] || fail "/ returned $STATUS"
[[ "$(header cache-control)" == *no-cache* ]] || fail "/ cache-control is '$(header cache-control)', expected no-cache"
[[ "$(header x-content-type-options)" == *nosniff* ]] || fail "/ is missing X-Content-Type-Options: nosniff"
[[ "$(header strict-transport-security)" == *max-age=* ]] || fail "/ is missing Strict-Transport-Security"
[[ "$(header server)" != *[0-9]* ]] || fail "Server header leaks a version: '$(header server)'"
ok "/ 200 with no-cache and security headers"
ok "/ sends Strict-Transport-Security"

req /config/
[ "$STATUS" = "200" ] || fail "/config/ returned $STATUS"
ok "/config/ 200"

req /config
[ "$STATUS" = "301" ] || fail "/config returned $STATUS, expected 301"
[ "$(header location)" = "/config/" ] || fail "/config Location is '$(header location)', expected /config/"
ok "/config 301 -> /config/"

req /does-not-exist/
[ "$STATUS" = "404" ] || fail "unknown path returned $STATUS, expected 404"
curl -sS "$BASE/does-not-exist/" | grep -q "404" || fail "404 response does not contain the 404 page"
ok "unknown path 404 with 404 page"

req /robots.txt
[ "$STATUS" = "200" ] || fail "/robots.txt returned $STATUS"
ok "/robots.txt 200"

ASSET="$(curl -sS "$BASE/" | grep -o '/_next/static/[^"]*\.js' | head -1)"
[ -n "$ASSET" ] || fail "index.html references no /_next/static/*.js asset"
req "$ASSET"
[ "$STATUS" = "200" ] || fail "$ASSET returned $STATUS"
[[ "$(header cache-control)" == *immutable* ]] || fail "$ASSET cache-control is '$(header cache-control)', expected immutable"
[[ "$(header x-content-type-options)" == *nosniff* ]] || fail "$ASSET is missing X-Content-Type-Options: nosniff"
ok "static asset immutable with security headers"

echo "All smoke tests passed against $BASE"
