#!/usr/bin/env bash
set -e

echo "🔧 Setting up project..."

# 1. Choose your package manager (uncomment one)
PACKAGE_MANAGER="npm"
# PACKAGE_MANAGER="yarn"
# PACKAGE_MANAGER="pnpm"

# 2. Install dependencies
echo "📦 Installing dependencies using $PACKAGE_MANAGER..."
$PACKAGE_MANAGER install

# 5. Confirm dev server
echo "✅ Setup complete. Start dev server with:"
echo ""
echo "   $PACKAGE_MANAGER run dev"
echo ""
