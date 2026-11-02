# NextFace — Capacitor Asset Resources

This folder holds the source images used to auto-generate all Android icon
and splash screen sizes via `@capacitor/assets`.

## Required files

| File | Size | Purpose |
|---|---|---|
| `icon.png` | 1024 × 1024 px | App icon (all Android densities) |
| `icon-foreground.png` | 1024 × 1024 px | Adaptive icon foreground layer |
| `icon-background.png` | 1024 × 1024 px | Adaptive icon background color layer |
| `splash.png` | 2732 × 2732 px | Splash screen (all densities) |
| `splash-dark.png` | 2732 × 2732 px | Splash screen — dark mode (optional) |

## Setup

Run the helper script once to copy the logo into this folder:

```bash
bash setup-assets.sh
```

Then generate all sized assets:

```bash
npm run cap:assets
```

## Notes

- `icon.png` and `splash.png` are both derived from `public/NextFace_LOGO.png`.
- The splash screen background colour `#080d1a` is set in `capacitor.config.ts`
  and must match the logo's background so there is no visible flash at launch.
- After generating assets, run `npm run cap:sync` to sync them into the
  Android project before building the APK.
