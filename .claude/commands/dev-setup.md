# /project:dev-setup — Verify & Fix Dev Environment

You are helping the developer verify and fix their local development environment for the MassStock Expo app.

## What to check and fix (in order):

### 1. Dependencies
- Run `npm install` if `node_modules` is missing or `package.json` was recently changed
- Check for peer dependency warnings and flag any blocking ones

### 2. Environment Variables
Read `.env` and `.env.local` (if it exists). Verify these required keys exist and are non-empty:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

If any are missing or still placeholder values, tell the developer exactly what to fill in and why.

### 3. CLI Tools
Check whether these are installed globally (run `npx expo --version`, `npx eas --version`, `npx firebase --version`):
- Expo CLI
- EAS CLI (`eas-cli`) — required for mobile builds
- Firebase CLI — required for Firestore rules & hosting deploys

Report versions found. If EAS CLI is missing, run: `npm install -g eas-cli`
If Firebase CLI is missing, run: `npm install -g firebase-tools`

### 4. TypeScript
Run `npx tsc --noEmit` and report any type errors. Fix trivial ones if possible, otherwise list them clearly.

### 5. Lint
Run `npm run lint` and report any errors. Fix auto-fixable issues.

### 6. Expo Config Validation
Run `npx expo config --type introspect` to confirm app.config.js resolves without errors.

## Output
After each check, print a status line:
- ✅ OK — (what passed)
- ⚠️  Warning — (non-blocking issue)
- ❌ Blocked — (must fix before proceeding)

End with a summary: "Ready to develop" or list what must be fixed first.
