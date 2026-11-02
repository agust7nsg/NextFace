# NextFace -- Android Studio Build Guide

## Prerequisites

1. **Node.js** (LTS recommended): https://nodejs.org/
2. **Android Studio** (latest stable): https://developer.android.com/studio
3. **Android SDK** (installed via Android Studio, API 34)

## One-Time Setup

### Option A: Automated (Recommended)

Run the setup script from the project root:

```bash
./setup-android.sh
```

This will install dependencies, build the web app, sync to Android, and make the Gradle wrapper executable.

### Option B: Manual

```bash
npm install
npm run build
npx cap sync android
chmod 755 android/gradlew
```

## Building the APK in Android Studio

1. Open **Android Studio**
2. Go to **File > Open** and select the `android/` folder inside this project
3. Wait for **Gradle sync** to complete (this may take a few minutes the first time as it downloads dependencies)
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. When the build finishes, click the **"locate"** link in the notification to find your APK

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Building a Release (Signed) APK

The release build is configured to use the debug signing key by default, so you can build a release APK immediately:

1. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Select the **release** build variant in the left panel if prompted
3. The release APK will be at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### For Play Store Distribution

To publish on the Play Store you need your own signing keystore:

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore nextface.keystore -alias nextface -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Add it to the `android/app/build.gradle` signing config:
   ```gradle
   signingConfigs {
       release {
           storeFile file('nextface.keystore')
           storePassword 'your-store-password'
           keyAlias 'nextface'
           keyPassword 'your-key-password'
       }
   }
   ```
3. Update the release build type to use it:
   ```gradle
   release {
       signingConfig signingConfigs.release
       ...
   }
   ```
4. Build > Generate Signed Bundle / APK > Android App Bundle (.aab)

## Troubleshooting

### Gradle sync fails: "Cannot find capacitor-android"
Run `npx cap sync android` from the project root, then re-sync in Android Studio.

### "gradlew: Permission denied"
Run `chmod 75x android/gradlew` from the project root.

### White screen on app launch
Run `npm run build && npx cap sync android` to rebuild and sync the latest web assets.

### Build fails with SDK not found
Open Android Studio's SDK Manager and install Android SDK Platform 34.

### App crashes on camera or photo access
Ensure the app has camera and storage permissions in Android Settings > Apps > NextFace > Permissions.

## Project Structure

```
project/
├── android/              # Android Studio project (open this folder)
│   ├── app/              # App module
│   ├── gradlew           # Gradle wrapper script
│   └── settings.gradle   # Project settings
├── src/                  # React web app source code
├── dist/                 # Built web assets (synced to android/)
├── setup-android.sh      # One-command setup script
└── capacitor.config.ts   # Capacitor configuration
```
