#!/bin/bash

# Portfolio Backup Script
# Keeps the last 2 versions as requested

BACKUP_DIR="./backups"
PROJECT_DIR="."
MAX_BACKUPS=2

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="portfolio_backup_$TIMESTAMP.tar.gz"

# Create backup
echo "Creating backup: $BACKUP_NAME"
tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$PROJECT_DIR" --exclude=backups --exclude=node_modules --exclude=dist .

# Keep only the last 2 backups
echo "Cleaning up old backups..."
ls -t "$BACKUP_DIR"/portfolio_backup_*.tar.gz | tail -n +3 | xargs rm -f 2>/dev/null || true

# List remaining backups
echo "Current backups:"
ls -t "$BACKUP_DIR"/portfolio_backup_*.tar.gz || echo "No backups found"

echo "Backup complete!"
