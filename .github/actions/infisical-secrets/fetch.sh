#!/usr/bin/env bash
# Fetch an Infisical folder into GITHUB_ENV with log masking.
#
# Inputs (environment):
#   INFISICAL_UNIVERSAL_AUTH_CLIENT_ID, INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
#       machine identity credential (read by `infisical login` itself, so the
#       values never appear on a command line)
#   INFISICAL_DOMAIN   e.g. https://eu.infisical.com
#   INFISICAL_ENV      e.g. prod
#   INFISICAL_PATH     e.g. /REVISES-TES-TABLES
#   REQUIRED_KEYS      space-separated keys that must be present
#   GITHUB_ENV         file the variables are appended to
#
# Fails loudly on any error, including an empty export: a broken credential
# must never produce a green step with no variables (the first symptom would be
# a misleading `docker login` failure several steps later).
set -euo pipefail

: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?INFISICAL_UNIVERSAL_AUTH_CLIENT_ID is required}"
: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET is required}"
: "${INFISICAL_DOMAIN:?INFISICAL_DOMAIN is required}"
: "${INFISICAL_ENV:?INFISICAL_ENV is required}"
: "${INFISICAL_PATH:?INFISICAL_PATH is required}"
: "${REQUIRED_KEYS:?REQUIRED_KEYS is required}"
: "${GITHUB_ENV:?GITHUB_ENV must point to a writable file}"

echo "Authenticating to Infisical (${INFISICAL_DOMAIN}) with Universal Auth..."
if ! INFISICAL_TOKEN="$(infisical login --method=universal-auth --domain="${INFISICAL_DOMAIN}" --silent --plain)"; then
  echo "::error title=Infisical login failed::Check INFISICAL_CLIENT_ID / INFISICAL_CLIENT_SECRET and the machine identity's access to ${INFISICAL_PATH}."
  exit 1
fi
if [ -z "${INFISICAL_TOKEN}" ]; then
  echo "::error title=Infisical login failed::Login returned an empty token."
  exit 1
fi
export INFISICAL_TOKEN
echo "::add-mask::${INFISICAL_TOKEN}"

export_file="$(mktemp)"
trap 'rm -f "${export_file}"' EXIT

if ! infisical export --domain="${INFISICAL_DOMAIN}" --env="${INFISICAL_ENV}" --path="${INFISICAL_PATH}" --format=dotenv > "${export_file}"; then
  echo "::error title=Infisical export failed::env=${INFISICAL_ENV} path=${INFISICAL_PATH}"
  exit 1
fi
if [ ! -s "${export_file}" ]; then
  echo "::error title=Infisical export is empty::No secret found in env=${INFISICAL_ENV} path=${INFISICAL_PATH}."
  exit 1
fi

count=0
while IFS= read -r line || [ -n "${line}" ]; do
  [ -z "${line}" ] && continue
  key="${line%%=*}"
  value="${line#*=}"
  # The dotenv format wraps values in single quotes: strip them.
  value="${value#\'}"
  value="${value%\'}"
  # Mask real secrets only; short flags like "true" or "fr-par" would otherwise
  # redact ordinary log output.
  if [ "${#value}" -ge 8 ]; then
    echo "::add-mask::${value}"
  fi
  printf '%s=%s\n' "${key}" "${value}" >> "${GITHUB_ENV}"
  count=$((count + 1))
done < "${export_file}"
echo "Exported ${count} secret(s) from ${INFISICAL_PATH} (${INFISICAL_ENV})."

missing=()
for key in ${REQUIRED_KEYS}; do
  if ! grep -q "^${key}=" "${GITHUB_ENV}"; then
    missing+=("${key}")
  fi
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "::error title=Missing secrets::${missing[*]} not found in Infisical ${INFISICAL_PATH} (${INFISICAL_ENV})."
  exit 1
fi
echo "All required keys present: ${REQUIRED_KEYS}"
