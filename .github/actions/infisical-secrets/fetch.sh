#!/usr/bin/env bash
# Fetch an Infisical folder into GITHUB_ENV with log masking.
#
# Inputs (environment):
#   INFISICAL_UNIVERSAL_AUTH_CLIENT_ID, INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
#       machine identity credential (read by `infisical login` itself, so the
#       values never appear on a command line)
#   INFISICAL_DOMAIN      e.g. https://eu.infisical.com
#   INFISICAL_PROJECT_ID  project holding the folder (required by the API when
#                         authenticating with a machine identity; not a secret)
#   INFISICAL_ENV         e.g. prod
#   INFISICAL_PATH        e.g. /REVISES-TES-TABLES
#   REQUIRED_KEYS         space-separated keys that must be present
#   GITHUB_ENV            file the variables are appended to
#
# The folder is expected to hold secrets only, so EVERY value is masked in the
# logs, whatever its length, line by line for multi-line values. Masking is
# registered before anything is written to GITHUB_ENV.
#
# The export is parsed as JSON (not line-by-line dotenv) so that a multi-line
# value cannot be split into bogus variables, and each variable is written with
# the GITHUB_ENV heredoc syntax and a random delimiter so that a value can
# never inject extra variables. Variable names are validated and names that
# could hijack later steps (PATH, NODE_OPTIONS, GITHUB_*, ...) are rejected.
#
# Fails loudly on any error, including an empty export: a broken credential
# must never produce a green step with no variables (the first symptom would be
# a misleading `docker login` failure several steps later).
set -euo pipefail

: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?INFISICAL_UNIVERSAL_AUTH_CLIENT_ID is required}"
: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET is required}"
: "${INFISICAL_DOMAIN:?INFISICAL_DOMAIN is required}"
: "${INFISICAL_PROJECT_ID:?INFISICAL_PROJECT_ID is required}"
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
pairs_file="$(mktemp)"
trap 'rm -f "${export_file}" "${pairs_file}"' EXIT

if ! infisical export --domain="${INFISICAL_DOMAIN}" --projectId="${INFISICAL_PROJECT_ID}" --env="${INFISICAL_ENV}" --path="${INFISICAL_PATH}" --format=json > "${export_file}"; then
  echo "::error title=Infisical export failed::env=${INFISICAL_ENV} path=${INFISICAL_PATH}"
  exit 1
fi
# Anything that is not a non-empty JSON array of secrets counts as an empty export.
if [ ! -s "${export_file}" ] || ! jq -e 'type == "array" and length > 0' "${export_file}" > /dev/null 2>&1; then
  echo "::error title=Infisical export is empty::No secret found in env=${INFISICAL_ENV} path=${INFISICAL_PATH}."
  exit 1
fi

# One "<base64 key> <base64 value>" line per secret: base64 keeps multi-line
# values on a single line so they can be read back safely.
if ! jq -r '.[] | ((.key // "") | @base64) + " " + ((.value // "") | @base64)' "${export_file}" > "${pairs_file}"; then
  echo "::error title=Infisical export unreadable::The export is not valid JSON secrets."
  exit 1
fi

# Pass 1: validate names, collect the pairs and register every mask. Nothing is
# written to GITHUB_ENV until all masks are in place.
keys=()
values=()
while read -r key_b64 value_b64; do
  key="$(printf '%s' "${key_b64}" | base64 -d)"
  value="$(printf '%s' "${value_b64}" | base64 -d)"
  if ! [[ "${key}" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "::error title=Invalid secret name::Secret name is not a valid environment variable name."
    exit 1
  fi
  case "${key}" in
    PATH | BASH_ENV | NODE_OPTIONS | LD_* | GITHUB_* | RUNNER_* | ACTIONS_* | INPUT_*)
      echo "::error title=Invalid secret name::${key} is reserved and cannot be exported to the job environment."
      exit 1
      ;;
  esac
  # Mask line by line: the runner masks per line, so a multi-line secret must
  # register each of its lines.
  while IFS= read -r masked_line || [ -n "${masked_line}" ]; do
    [ -n "${masked_line}" ] && echo "::add-mask::${masked_line}"
  done <<< "${value}"
  keys+=("${key}")
  values+=("${value}")
done < "${pairs_file}"

# Pass 2: write each variable with a random heredoc delimiter, so no value can
# terminate its own block and inject further variables.
for i in "${!keys[@]}"; do
  delim="EOF_$(openssl rand -hex 16)"
  if [[ "${values[$i]}" == *"${delim}"* ]]; then
    echo "::error title=Invalid secret value::Value of ${keys[$i]} contains the heredoc delimiter."
    exit 1
  fi
  { echo "${keys[$i]}<<${delim}"; printf '%s\n' "${values[$i]}"; echo "${delim}"; } >> "${GITHUB_ENV}"
done
echo "Exported ${#keys[@]} secret(s) from ${INFISICAL_PATH} (${INFISICAL_ENV})."

missing=()
for required in ${REQUIRED_KEYS}; do
  found=0
  for key in "${keys[@]}"; do
    if [ "${key}" = "${required}" ]; then
      found=1
      break
    fi
  done
  if [ "${found}" -eq 0 ]; then
    missing+=("${required}")
  fi
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "::error title=Missing secrets::${missing[*]} not found in Infisical ${INFISICAL_PATH} (${INFISICAL_ENV})."
  exit 1
fi
echo "All required keys present: ${REQUIRED_KEYS}"
