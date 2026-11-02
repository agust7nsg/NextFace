#!/usr/bin/env bash
set -e

echo "========================================="
echo "  NextFace Android Setup Script"
echo "========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Download it from https://nodejs.org/ (LTS version recommended)."
    exit 1
fi

echo "Node.js version: $(node -v)"
echo ""

# Step 1: Install dependencies
echo "[1/3] Installing dependencies..."
npm install
echo ""

# Step 2: Build the web app
echo "[2/3] Building web assets..."
npm run build
echo ""

# Step 3: Sync to Android
echo "[3/3] Syncing to Android project..."
npx cap sync android
echo ""

# Make gradlew executable (in case of permission issues from download)
chmod 755 android/gradlew

echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Open Android Studio"
echo "  2. File > Open > select the 'android' folder"
echo "  3. Wait for Gradle sync to finish"
echo "  4. Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "  5. Find your APK at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
