#!/usr/bin/env bash
# ─── NERVANA SWEETS · automatic PostgreSQL backup ───
# Schedule daily via cron:  0 3 * * *  /app/scripts/backup.sh
# Keeps the last 14 daily backups (rotated).
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/nervana-$STAMP.sql.gz"

echo "▶ Backing up database → $FILE"
pg_dump "$DATABASE_URL" | gzip > "$FILE"
echo "✓ Backup complete ($(du -h "$FILE" | cut -f1))"

# Rotate old backups
find "$BACKUP_DIR" -name "nervana-*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "✓ Rotated backups older than $RETENTION_DAYS days"
