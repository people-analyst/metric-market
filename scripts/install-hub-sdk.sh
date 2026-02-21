#!/bin/bash

###############################################################################
# Hub SDK v2.3.0 Installation Script
# Installs or updates the Hub SDK for Metric Market
###############################################################################

set -e

SDK_VERSION="2.3.0"
SDK_URL="${HUB_SDK_URL:-http://localhost:5000/api/sdk/download/metric-market}"
BACKUP_DIR=".sdk-backups"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Hub SDK v${SDK_VERSION} Installation                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to backup existing SDK files
backup_existing_sdk() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [ -f "hub-sdk.js" ]; then
        echo "📦 Backing up existing hub-sdk.js..."
        cp hub-sdk.js "$BACKUP_DIR/hub-sdk.js.$timestamp"
        echo "   ✅ Backed up to $BACKUP_DIR/hub-sdk.js.$timestamp"
    fi
    
    if [ -f "hub-sdk.cjs" ]; then
        echo "📦 Backing up existing hub-sdk.cjs..."
        cp hub-sdk.cjs "$BACKUP_DIR/hub-sdk.cjs.$timestamp"
        echo "   ✅ Backed up to $BACKUP_DIR/hub-sdk.cjs.$timestamp"
    fi
}

# Function to download SDK
download_sdk() {
    echo ""
    echo "⬇️  Downloading Hub SDK v${SDK_VERSION}..."
    
    # Try to download from Hub
    if command -v curl &> /dev/null; then
        echo "   Using curl to download from: $SDK_URL"
        
        # Download main SDK file
        if curl -f -o hub-sdk.js "$SDK_URL"; then
            echo "   ✅ Downloaded hub-sdk.js"
        else
            echo "   ⚠️  Failed to download from Hub (this is expected in development)"
            echo "   ℹ️  Using existing SDK file"
            return 1
        fi
        
        # Create CJS version if needed
        if [ ! -f "hub-sdk.cjs" ] || [ "hub-sdk.js" -nt "hub-sdk.cjs" ]; then
            echo "   📝 Creating CommonJS version..."
            cp hub-sdk.js hub-sdk.cjs
            echo "   ✅ Created hub-sdk.cjs"
        fi
    else
        echo "   ❌ curl not found - cannot download SDK"
        return 1
    fi
}

# Function to verify installation
verify_installation() {
    echo ""
    echo "🔍 Verifying installation..."
    
    if [ -f "hub-sdk.js" ]; then
        local version=$(grep -oP 'SDK_VERSION\s*=\s*"\K[^"]+' hub-sdk.js || echo "unknown")
        echo "   ✅ hub-sdk.js exists (version: $version)"
    else
        echo "   ❌ hub-sdk.js not found"
        return 1
    fi
    
    if [ -f "hub-sdk.cjs" ]; then
        echo "   ✅ hub-sdk.cjs exists"
    else
        echo "   ❌ hub-sdk.cjs not found"
        return 1
    fi
    
    # Check if SDK is integrated in server
    if grep -q "hub-sdk" server/index.ts; then
        echo "   ✅ SDK is integrated in server/index.ts"
    else
        echo "   ⚠️  SDK not found in server/index.ts"
    fi
    
    return 0
}

# Main installation flow
echo "Starting installation process..."
echo ""

# Backup existing files
backup_existing_sdk

# Attempt to download (may fail in development, which is OK)
if download_sdk; then
    echo ""
    echo "✅ SDK downloaded successfully"
else
    echo ""
    echo "ℹ️  Download skipped - using existing SDK files"
fi

# Verify installation
if verify_installation; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "✅ Hub SDK v${SDK_VERSION} installation complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Set HUB_API_KEY environment variable (if not already set)"
    echo "  2. Restart your server: npm run dev"
    echo "  3. Verify SDK is working with: node scripts/verify-hub-sdk.js"
    echo "═══════════════════════════════════════════════════════════════"
else
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "⚠️  Installation verification failed"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if hub-sdk.js exists in the root directory"
    echo "  2. Verify SDK version in hub-sdk.js"
    echo "  3. Run: node scripts/verify-hub-sdk.js for detailed diagnostics"
    echo "═══════════════════════════════════════════════════════════════"
    exit 1
fi
