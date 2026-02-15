#!/bin/bash
set -e  # Exit immediately on any error

# --- CONFIGURATION ---
SERVER_USER="root"
SERVER_IP="143.110.228.226"
REMOTE_DIR="/var/www/lokerrealty"

# COLORS
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Local Build & Deploy...${NC}"

# 1. Build React App Locally
# Navigate to the frontend directory relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Building React App..."
if npm run build; then
    echo -e "${GREEN}✅ Build Successful!${NC}"
else
    echo -e "${RED}❌ Build Failed.${NC}"
    exit 1
fi

# 2. Upload ONLY changed files to server (rsync is fast after first deploy)
echo "📂 Syncing changed files to server..."
rsync -avz --delete \
    build/ "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# -a = archive mode (recursive, preserves permissions, etc.)
# -v = verbose (shows each file transferred)
# -z = compress during transfer
# --delete = remove files on server that no longer exist in build/

echo -e "${GREEN}✅ Files synced!${NC}"

# 3. Reload Nginx
echo "🔄 Reloading Nginx..."
ssh "$SERVER_USER@$SERVER_IP" "systemctl reload nginx"

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
