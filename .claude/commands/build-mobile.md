# /project:build-mobile — EAS Build for Android / iOS

Guide through building and submitting the MassStock app for Android (Google Play) and/or iOS (App Store) using EAS Build.

## Step 0: Determine target
Ask the user (if not already specified): Android, iOS, or both?

## Step 1: EAS Setup (first time only)
Check if `eas.json` exists in the project root. If not, this is the initial EAS setup:
1. Run `npx eas-cli --version` to confirm EAS CLI is installed
2. Run `npx eas init` to link the project to an EAS account
3. Create `eas.json` with three profiles:

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "http://192.168.0.100:3001/api" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://api.masstock.com/api" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_API_URL": "https://api.masstock.com/api" },
      "android": { "buildType": "app-bundle" },
      "ios": { "simulator": false }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 2: Version bump
Read `app.json`. For a production build:
- Increment `android.versionCode` by 1
- Increment `ios.buildNumber` by 1 (use timestamp format `YYYYMMDD.N` if preferred)
- Confirm `version` (semver) is correct for this release

Show the user the before/after values and ask for confirmation before writing.

## Step 3: Pre-flight
Run the pre-flight checks. Block if any ❌ exist.

## Step 4: Trigger build
For **Android** production:
```
npx eas build --platform android --profile production
```
For **iOS** production:
```
npx eas build --platform ios --profile production
```
For **both**:
```
npx eas build --platform all --profile production
```

EAS builds run in the cloud. Show the build URL from the output so the user can monitor progress.

## Step 5: Download & test (after build completes)
Once the build link shows "Finished":
- Android: download the `.aab` from EAS dashboard and test on a device
- iOS: TestFlight upload happens via `eas submit` (see Step 6)

## Step 6: Store submission
**Android** (Google Play):
```
npx eas submit --platform android --latest
```
Requires a Google Play service account JSON. Walk the user through setting it up in `eas.json` under `submit.production.android.serviceAccountKeyPath` if not already done.

**iOS** (App Store):
```
npx eas submit --platform ios --latest
```
Requires Apple credentials. EAS handles this interactively on first run.

## Notes
- EAS builds are cloud-based — no local Xcode or Android SDK needed for production builds
- The `development` profile builds a dev client for local testing with `expo start --dev-client`
- The `preview` profile creates an internal distribution build (APK/IPA) for QA testing
- Secrets like Firebase API keys are in `EXPO_PUBLIC_*` env vars — EAS picks them up from `eas.json` env or from the EAS Secrets dashboard
