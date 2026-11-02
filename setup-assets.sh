#!/usr/bin/env bash
# Copies the NextFace logo from public/ into the resources/ folder
# so @capacitor/assets can generate all icon and splash screen sizes.
#
# Run once before `npm run cap:assets`.
# Requires ImageMagick (convert) for the resize step.
# Install on macOS: brew install imagemagick
# Install on Ubuntu/Debian: sudo apt install imagemagick

set -e

SRC="public/NextFace_LOGO.png"
OUT="resources"

if [ ! -f "$SRC" ]; then
  echo "ERROR: $SRC not found. Make sure you are running this from the project root."
  exit 1
fi

echo "Preparing $OUT directory..."

# App icon — 1024x1024 (same logo, already square)
convert "$SRC" -resize 1024x1024 "$OUT/icon.png"

# Adaptive icon foreground — logo centred on transparent background, 1024x1024
convert "$SRC" -resize 512x512 -gravity center -background none \
  -extent 1024x1024 "$OUT/icon-foreground.png"

# Adaptive icon background — solid brand colour to match the logo background
convert -size 1024x1024 xc:"#080d1a" "$OUT/icon-background.png"

# Splash screen — logo centred on brand-colour canvas, 2732x2732
convert -size 2732x2732 xc:"#080d1a" \
  "$SRC" -resize 900x900 -gravity center -composite \
  "$OUT/splash.png"

# Dark-mode splash (identical in this case)
cp "$OUT/splash.png" "$OUT/splash-dark.png"

echo ""
echo "Done. All source assets are ready in $OUT/"
echo "Next: npm run cap:assets"
