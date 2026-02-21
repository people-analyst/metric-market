#!/bin/bash

# Spoke Cockpit SDK v2.0 Installation Script
# Usage: bash scripts/install-spoke-sdk.sh

set -e

echo "========================================"
echo "Spoke Cockpit SDK v2.0 Installation"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
HUB_URL="${HUB_URL:-http://localhost:5000}"
SDK_URL="${HUB_URL}/api/sdk/cockpit/metric-market"
OUTPUT_FILE="spoke-cockpit-sdk.js"

echo "Step 1: Downloading SDK from ${SDK_URL}"
echo ""

if command -v curl &> /dev/null; then
    if curl -f -o "${OUTPUT_FILE}" "${SDK_URL}"; then
        echo -e "${GREEN}✓${NC} SDK downloaded successfully"
    else
        echo -e "${RED}✗${NC} Failed to download SDK"
        echo ""
        echo "Please ensure:"
        echo "  1. The Hub server is running at ${HUB_URL}"
        echo "  2. The /api/sdk/cockpit/metric-market endpoint is available"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}✗${NC} curl is not installed"
    echo "Please install curl or download manually:"
    echo "  ${SDK_URL}"
    exit 1
fi

echo ""
echo "Step 2: Verifying installation"
echo ""

if [ -f "scripts/verify-spoke-sdk.ts" ]; then
    if npx tsx scripts/verify-spoke-sdk.ts; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✓ Installation Complete!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Start the server: npm run dev"
        echo "  2. Check logs for: '✓ Spoke Cockpit SDK v2.0 mounted successfully'"
        echo "  3. Read SPOKE_COCKPIT_SETUP.md for detailed documentation"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠ Installation completed but verification found issues${NC}"
        echo "Check the output above for details."
        echo ""
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Verification script not found, skipping verification"
    echo -e "${GREEN}✓${NC} SDK file downloaded"
    echo ""
fi

exit 0
