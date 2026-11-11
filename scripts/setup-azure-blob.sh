#!/usr/bin/env bash
# Provision Azure Blob Storage for Darija Genie and write the connection string
# into apps/web/.env.local. Requires an authenticated Azure CLI session.
#
# Usage:
#   bash scripts/setup-azure-blob.sh
#
# Safe to re-run: existing resource group / account / container are reused.
# Never prints the connection string.

set -euo pipefail
cd "$(dirname "$0")/.."

AZ="${AZ:-$HOME/.local/bin/az}"
if ! command -v "$AZ" >/dev/null 2>&1 && [ ! -x "$AZ" ]; then
  AZ=$(command -v az || true)
fi
if [ -z "$AZ" ] || ! "$AZ" --version >/dev/null 2>&1; then
  echo "❌ Azure CLI not found. Install it first (see scripts/setup-azure-cli.sh)."
  exit 1
fi

if ! "$AZ" account show -o none 2>/dev/null; then
  echo "❌ Not signed in. Run: $AZ login --use-device-code"
  exit 1
fi

RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-darija-genie-rg}"
LOCATION="${AZURE_LOCATION:-spaincentral}"
CONTAINER="${AZURE_STORAGE_CONTAINER:-audio}"
ENV_FILE="apps/web/.env.local"

# Storage account names: 3-24 chars, lowercase letters + digits only.
if [ -z "${AZURE_STORAGE_ACCOUNT:-}" ]; then
  SUFFIX=$(openssl rand -hex 3)
  AZURE_STORAGE_ACCOUNT="darijagenieaudio${SUFFIX}"
fi

echo "→ Resource group: $RESOURCE_GROUP ($LOCATION)"
"$AZ" group create --name "$RESOURCE_GROUP" --location "$LOCATION" -o none

if "$AZ" storage account show --name "$AZURE_STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" -o none 2>/dev/null; then
  echo "→ Storage account already exists: $AZURE_STORAGE_ACCOUNT"
else
  echo "→ Creating storage account: $AZURE_STORAGE_ACCOUNT"
  "$AZ" storage account create \
    --name "$AZURE_STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access true \
    -o none
fi

echo "→ Ensuring container '$CONTAINER' with anonymous read access"
"$AZ" storage container create \
  --name "$CONTAINER" \
  --account-name "$AZURE_STORAGE_ACCOUNT" \
  --public-access blob \
  --auth-mode key \
  -o none

CONNECTION_STRING=$("$AZ" storage account show-connection-string \
  --name "$AZURE_STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query connectionString -o tsv)

# Write values into .env.local without echoing them.
CONNECTION_STRING="$CONNECTION_STRING" \
AZURE_STORAGE_ACCOUNT="$AZURE_STORAGE_ACCOUNT" \
AZURE_STORAGE_CONTAINER="$CONTAINER" \
ENV_FILE="$ENV_FILE" \
python3 - <<'PY'
import os
from pathlib import Path

env_file = Path(os.environ["ENV_FILE"])
updates = {
    "AZURE_STORAGE_CONNECTION_STRING": os.environ["CONNECTION_STRING"],
    "AZURE_STORAGE_CONTAINER": os.environ["AZURE_STORAGE_CONTAINER"],
    "AZURE_STORAGE_ACCOUNT": os.environ["AZURE_STORAGE_ACCOUNT"],
}

lines = env_file.read_text().splitlines() if env_file.exists() else []
kept = [ln for ln in lines if not any(ln.startswith(k + "=") for k in updates)]
while kept and kept[-1].strip() == "":
    kept.pop()
kept.append("")
kept.append("# --- Azure Blob Storage (audio files) ---")
for key, value in updates.items():
    kept.append(f"{key}={value}")
env_file.write_text("\n".join(kept) + "\n")
print("   env: wrote AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER, AZURE_STORAGE_ACCOUNT")
PY

ACCOUNT_KEY_COUNT=$("$AZ" storage account keys list \
  --account-name "$AZURE_STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query 'length(keys)' -o tsv 2>/dev/null || echo "?")

echo
echo "✅ Azure Blob Storage ready"
echo "   Account:   $AZURE_STORAGE_ACCOUNT"
echo "   Region:    $LOCATION"
echo "   Group:     $RESOURCE_GROUP"
echo "   Container: $CONTAINER (public blob read)"
echo "   Endpoint:  https://$AZURE_STORAGE_ACCOUNT.blob.core.windows.net/$CONTAINER/"
echo "   Keys:      $ACCOUNT_KEY_COUNT access key(s) present"
echo
echo "Next: restart 'pnpm dev', then verify with:"
echo "   cd apps/web && node scripts/verify-db.mjs"
