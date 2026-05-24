# /project:pre-flight — Pre-Deployment Health Check

Run this before any deployment (web or mobile). Catches issues before they reach a build server.

## Checks (run in this order):

### 1. Environment Mode
Read `app.config.js` and `.env`. Confirm `EXPO_PUBLIC_API_URL` is set to the production URL (`https://api.masstock.com/api`), NOT a local IP or `localhost`. If it's still pointing to `192.168.0.100` or `localhost`, flag it as a blocker — the user must set `.env.local` with the prod URL or update `.env` before building for production.

### 2. TypeScript Check
Run `npx tsc --noEmit`. Zero errors required. If there are errors, list them by file with line numbers and fix any that are straightforward (missing types, minor issues). Block deployment if errors remain.

### 3. Lint
Run `npm run lint`. Fix auto-fixable issues. Block deployment on unfixed errors.

### 4. Bundle Analysis (quick)
Run `npx expo export --platform web --dump-sourcemap 2>&1 | tail -20` to verify the web bundle compiles without errors. (Skip if this takes too long — just note it should be done.)

### 5. App Config Sanity
Read `app.json` and `app.config.js`. Verify:
- `version` is set and follows semver
- `android.versionCode` exists (increment if this is a new release)
- `ios.buildNumber` exists (increment if this is a new release)
- App icons are present in `assets/images/` (icon.png, splash-icon.png, adaptive-icon.png)

### 6. Firebase Rules
Check that `firestore.rules` exists and is non-empty. Warn if it still contains the default open rules (`allow read, write: if true`).

### 7. Secrets Check
Run `git diff --cached` and `git status`. Make sure `.env` and `.env.local` are NOT staged for commit (they should be in `.gitignore`). If they are staged, remove them immediately.

## Output format:
```
PRE-FLIGHT REPORT — [timestamp]
================================
✅ TypeScript: clean
✅ Lint: clean  
⚠️  API URL: still pointing to dev (192.168.0.100) — update before prod build
❌ versionCode: not incremented — last build was 1, still 1
...

STATUS: [READY / BLOCKED]
```

If BLOCKED, list exactly what must be fixed before proceeding.
