#!/bin/bash
# Auto-deploy script for SPARCINTRO
# Usage: ./deploy.sh [options]
#
# Options:
#   --skip-build    Skip the build step (use existing dist/)
#   --dry-run       Show what would be done without executing

set -e

# Configuration
SSH_HOST="public-server"
REMOTE_DIR="/home/luobin/Yanlai/IntroNew"
URL="https://game.agaii.org/IntroNew/"

# Parse arguments
SKIP_BUILD=false
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --skip-build) SKIP_BUILD=true ;;
        --dry-run) DRY_RUN=true ;;
        *) echo "Unknown argument: $arg"; exit 1 ;;
    esac
done

echo "🚀 SPARCINTRO Deploy Script"
echo "============================"

# Step 1: Build
if [ "$SKIP_BUILD" = false ]; then
    echo ""
    echo "📦 Building project..."
    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY RUN] Would run: npm run build"
    else
        npm run build
        echo "  ✅ Build complete"
    fi
else
    echo "  ⏭️  Skipping build (--skip-build)"
fi

# Step 2: Upload
echo ""
echo "📤 Uploading to server..."
if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would run: rsync -avz --delete dist/ $SSH_HOST:$REMOTE_DIR/"
else
    rsync -avz --delete dist/ $SSH_HOST:$REMOTE_DIR/
    echo "  ✅ Upload complete"
fi

# Step 3: Verify
echo ""
echo "🔍 Verifying deployment..."
if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would check: $URL"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ Deployment verified (HTTP $HTTP_CODE)"
    else
        echo "  ⚠️  Unexpected HTTP code: $HTTP_CODE"
    fi
fi

echo ""
echo "🎉 Done! Access at: $URL"
