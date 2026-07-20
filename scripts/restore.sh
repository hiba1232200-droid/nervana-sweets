#!/usr/bin/env bash
# ─── NERVANA SWEETS · restore a PostgreSQL backup ───
# Usage:  ./scripts/restore.sh ./backups/nervana-YYYYMMDD-HHMMSS.sql.gz
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
FILE="${1:?Usage: restore.sh <backup.sql.gz>}"

echo "⚠  This will overwrite the current database. Ctrl-C to abort."
sleep 3
echo "▶ Restoring from $FILE"
gunzip -c "$FILE" | psql "$DATABASE_URL"
echo "✓ Restore complete"
