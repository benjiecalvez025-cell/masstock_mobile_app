# /project:ship — Full Release Pipeline

Master command that orchestrates the complete release of MassStock. Run this when you're ready to ship a version.

## What this does
1. Runs all pre-flight checks
2. Asks which targets to release (web / Android / iOS / all)
3. Bumps versions appropriately
4. Deploys web to Firebase Hosting (if selected)
5. Triggers EAS builds for mobile (if selected)
6. Creates a git tag for the release
7. Gives you a post-ship checklist

---

## Step 1: Pre-flight (REQUIRED — cannot skip)

Run all checks from `/project:pre-flight`. If any ❌ blockers exist, STOP. List them and tell the user to fix them first.

---

## Step 2: Identify the release

Ask the user:
- "What version is this? (current: read from app.json `version`)"
- "What are you shipping? (web / android / ios / all)"
- "What changed? (brief release notes for the git tag)"

If the user has already provided this in their message, use it — don't ask again.

---

## Step 3: Version bump

Read current versions from `app.json`:
- `version` (semver, e.g. "1.0.0")
- `android.versionCode` (integer)  
- `ios.buildNumber` (string)

If this is a new version:
- Bump `version` per semver (patch/minor/major based on what changed)
- Increment `android.versionCode` by 1
- Update `ios.buildNumber`

Show the diff and ask for confirmation before writing to `app.json`.

---

## Step 4: Web deployment (if selected)

Follow the steps from `/project:deploy-web`:
1. Build: `npx expo export --platform web`
2. Deploy Firestore rules if changed
3. Deploy: `npx firebase deploy --only hosting`
4. Report the live URL

---

## Step 5: Mobile build (if selected)

Follow the steps from `/project:build-mobile`:
1. Confirm `eas.json` exists
2. Trigger: `npx eas build --platform [android|ios|all] --profile production`
3. Show EAS dashboard link
4. Note: builds are async — the user can monitor on the EAS dashboard

---

## Step 6: Firestore rules deploy (always check)

If `firestore.rules` was modified since last deploy:
```
npx firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 7: Git tag

After web deployment and/or confirming mobile builds started:

```
git add app.json
git commit -m "chore: bump version to v{VERSION}"
git tag -a v{VERSION} -m "{RELEASE_NOTES}"
```

Ask the user if they want to push the tag: `git push origin v{VERSION}`

---

## Step 8: Post-ship checklist

Print this checklist for the user to verify manually:

```
POST-SHIP CHECKLIST — v{VERSION}
=================================
Web (Firebase Hosting):
  [ ] App loads at the Firebase hosting URL
  [ ] Login / signup works
  [ ] API calls succeed (no console errors)
  [ ] Dark mode renders correctly

Mobile (EAS):
  [ ] Build status: check https://expo.dev
  [ ] Download preview build and smoke-test on device
  [ ] Submit to stores when build passes QA
  [ ] Update store listing screenshots if UI changed

Firebase:
  [ ] Firestore rules deployed (no open read/write rules in prod)
  [ ] Check Firebase Console → Usage for abnormal traffic

Done:
  [ ] Git tag pushed: v{VERSION}
  [ ] Notify team / update changelog
```

---

## Error handling
- If any step fails, stop and report the exact error. Do not proceed to later steps.
- If the user is mid-release and something fails, tell them exactly what was completed and what was not, so they can resume safely.
