# /project:setup-ci — Set Up GitHub Actions CI/CD Pipeline

Create a GitHub Actions workflow for MassStock that runs on every push and handles automated builds.

## What to create

### File: `.github/workflows/ci.yml`

Create a CI workflow that:
1. On every pull request to `master`: lint + TypeScript check
2. On push to `master`: lint + TypeScript check + web build verification
3. On git tag `v*`: full production build trigger via EAS + Firebase web deploy

### File: `.github/workflows/deploy-web.yml`

Separate workflow for web deploys:
- Triggered on push to `master` or manually via `workflow_dispatch`
- Builds the Expo web app and deploys to Firebase Hosting

---

## Step 1: Create the CI workflow

Write `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master, main]
    tags: ['v*']
  pull_request:
    branches: [master, main]

jobs:
  lint-and-typecheck:
    name: Lint & TypeScript
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  build-web:
    name: Build Web
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    if: github.ref == 'refs/heads/master' || startsWith(github.ref, 'refs/tags/v')
    env:
      EXPO_PUBLIC_API_URL: ${{ secrets.EXPO_PUBLIC_API_URL }}
      EXPO_PUBLIC_FIREBASE_API_KEY: ${{ secrets.EXPO_PUBLIC_FIREBASE_API_KEY }}
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN }}
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.EXPO_PUBLIC_FIREBASE_PROJECT_ID }}
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET }}
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
      EXPO_PUBLIC_FIREBASE_APP_ID: ${{ secrets.EXPO_PUBLIC_FIREBASE_APP_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx expo export --platform web
      - uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/

  deploy-web:
    name: Deploy to Firebase Hosting
    runs-on: ubuntu-latest
    needs: build-web
    if: github.ref == 'refs/heads/master' || startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: web-build
          path: dist/
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}

  eas-build:
    name: EAS Build (Mobile)
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile production --non-interactive
```

---

## Step 2: Set up GitHub Secrets

Tell the user they need to add these secrets in GitHub → Settings → Secrets and variables → Actions:

| Secret name | Where to get it |
|---|---|
| `EXPO_PUBLIC_API_URL` | Production API URL: `https://api.masstock.com/api` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app config |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | same |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Project Settings → Service accounts → Generate new private key → JSON content |
| `FIREBASE_PROJECT_ID` | Firebase project ID string |
| `EXPO_TOKEN` | expo.dev → Account → Access Tokens → Create |

---

## Step 3: Firebase GitHub Action setup

For the `FirebaseExtended/action-hosting-deploy` action to work, run locally:
```
npx firebase init hosting:github
```
This sets up the GitHub Action integration and creates the service account automatically.

---

## Step 4: Verify

After pushing the workflow files:
1. Open a test PR — confirm lint and typecheck run
2. Merge to master — confirm web build and Firebase deploy run
3. Push a tag `v1.0.0` — confirm EAS build triggers

Write the workflow files now, then give the user the secrets setup checklist.
