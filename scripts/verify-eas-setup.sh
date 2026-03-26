#!/bin/bash

# Expo EAS Setup Verification Script
# Validates environment, Expo CLI, and EAS configuration
# Usage: bash scripts/verify-eas-setup.sh

set -e

echo "🔍 Thoryx Expo EAS Setup Verification"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for results
PASSED=0
FAILED=0

# Helper functions
check_passed() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

check_failed() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

check_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

echo "📋 Step 1: Checking Node.js and npm"
echo ""

if ! command -v node &> /dev/null; then
  check_failed "Node.js not installed"
else
  NODE_VERSION=$(node -v)
  if [[ $NODE_VERSION == v20* ]] || [[ $NODE_VERSION == v21* ]] || [[ $NODE_VERSION == v22* ]]; then
    check_passed "Node.js version: $NODE_VERSION"
  else
    check_warning "Node.js version is $NODE_VERSION (recommend v20+)"
  fi
fi

if ! command -v npm &> /dev/null; then
  check_failed "npm not installed"
else
  check_passed "npm installed: $(npm -v)"
fi

echo ""
echo "📋 Step 2: Checking Expo CLI"
echo ""

if command -v expo &> /dev/null; then
  EXPO_VERSION=$(expo --version 2>/dev/null)
  check_passed "Expo CLI installed: $EXPO_VERSION"
else
  check_failed "Expo CLI not installed"
  echo "   Install with: npm install -g expo-cli"
fi

echo ""
echo "📋 Step 3: Checking EAS CLI"
echo ""

if command -v eas &> /dev/null; then
  EAS_VERSION=$(eas --version 2>/dev/null)
  check_passed "EAS CLI installed: $EAS_VERSION"
else
  check_failed "EAS CLI not installed"
  echo "   Install with: npm install -g eas-cli"
fi

echo ""
echo "📋 Step 4: Checking Expo project files"
echo ""

if [ -f "app.json" ]; then
  check_passed "app.json exists"
else
  check_failed "app.json not found"
fi

if [ -f "eas.json" ]; then
  check_passed "eas.json exists"
else
  check_warning "eas.json not found (will be created by eas build:configure)"
fi

echo ""
echo "📋 Step 5: Checking npm dependencies"
echo ""

if npm list expo &>/dev/null; then
  check_passed "expo package installed"
else
  check_warning "expo package not found (install with: npm install expo)"
fi

if npm list react-native &>/dev/null; then
  check_passed "react-native package installed"
else
  check_warning "react-native package not found"
fi

echo ""
echo "📋 Step 6: Checking TypeScript configuration"
echo ""

if [ -f "tsconfig.json" ]; then
  check_passed "tsconfig.json exists"
else
  check_warning "tsconfig.json not found"
fi

if npm list typescript &>/dev/null; then
  check_passed "TypeScript installed"
else
  check_warning "TypeScript not installed (install with: npm install --save-dev typescript)"
fi

echo ""
echo "📋 Step 7: Checking Git configuration"
echo ""

if git config user.name &>/dev/null; then
  check_passed "Git user name configured: $(git config user.name)"
else
  check_warning "Git user name not configured (set with: git config user.name 'Your Name')"
fi

if git config user.email &>/dev/null; then
  check_passed "Git user email configured: $(git config user.email)"
else
  check_warning "Git user email not configured (set with: git config user.email 'your@email.com')"
fi

REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  check_failed "No git remote configured"
else
  check_passed "Git remote: $REMOTE"
fi

echo ""
echo "📋 Step 8: Checking Expo login status"
echo ""

if [ -n "$EXPO_TOKEN" ]; then
  check_passed "EXPO_TOKEN environment variable is set"
else
  check_warning "EXPO_TOKEN not set in environment"
  echo "   Set with: export EXPO_TOKEN=<token-from-expo>"
  echo "   Or login with: expo login"
fi

echo ""
echo "📋 Step 9: Checking GitHub Actions secrets"
echo ""

echo "GitHub Actions secrets status:"
echo "(These must be set in repository settings → Secrets and variables → Actions)"
echo ""
echo "  Required secrets:"
echo "  - EAS_TOKEN (from: eas login, then eas token)"
echo ""
check_warning "Run: gh secret list (if GitHub CLI installed)"

echo ""
echo "📋 Step 10: Checking GitHub Actions workflows"
echo ""

if [ -f ".github/workflows/ci.yml" ]; then
  check_passed ".github/workflows/ci.yml exists"
else
  check_failed ".github/workflows/ci.yml not found"
fi

if [ -f ".github/workflows/deploy.yml" ]; then
  check_passed ".github/workflows/deploy.yml exists"
else
  check_failed ".github/workflows/deploy.yml not found"
fi

echo ""
echo "📋 Step 11: Checking documentation"
echo ""

DOCS=("DEPLOYMENT.md" "SECRETS.md")

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    check_passed "$doc exists"
  else
    check_warning "$doc not found"
  fi
done

echo ""
echo "======================================"
echo "📊 Verification Results"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready for EAS builds.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Create Expo account: https://expo.dev"
  echo "  2. Run: eas build:configure"
  echo "  3. Set up iOS provisioning (if building iOS)"
  echo "  4. Set up Android signing (if building Android)"
  echo "  5. Create GitHub secret EAS_TOKEN"
  echo "  6. Deploy: git push origin main"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. See above for details.${NC}"
  echo ""
  echo "Fix errors before proceeding. Refer to:"
  echo "  - DEPLOYMENT.md for technical details"
  echo "  - SECRETS.md for environment variable setup"
  exit 1
fi
