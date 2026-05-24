# /project:deploy-web — Deploy Web Version to Firebase Hosting

Deploy the Expo web build to Firebase Hosting. The output goes to `dist/` which maps to Firebase Hosting per `firebase.json`.

## Steps (execute in order, stop on any failure):

### 1. Pre-flight
Run the pre-flight checks first — specifically verify the API URL is set to production. If blocked, stop and report.

### 2. Confirm Firebase login
Run `npx firebase login --no-localhost 2>&1 | head -5` to check auth status. If not logged in, tell the user to run `npx firebase login` manually (it needs a browser).

### 3. Check Firebase project
Run `npx firebase use` to confirm the active project. The project should match `EXPO_PUBLIC_FIREBASE_PROJECT_ID` from `.env`. If mismatched, run `npx firebase use <project-id>`.

### 4. Deploy Firestore rules & indexes (if changed)
Check if `firestore.rules` or `firestore.indexes.json` have uncommitted changes or were recently modified:
```
git diff HEAD -- firestore.rules firestore.indexes.json
```
If changed, deploy them first:
```
npx firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Build web
```
npx expo export --platform web
```
This outputs to `dist/`. Watch for errors and report them.

### 6. Deploy to Firebase Hosting
```
npx firebase deploy --only hosting
```
Capture the hosting URL from the output and show it to the user.

### 7. Smoke test
Ask the user to open the hosting URL and confirm the app loads. Remind them to check:
- Login works (Firebase Auth)
- API calls succeed (check browser console for 4xx/5xx)
- No CORS errors

## Output
Show each step's status. End with the live URL if successful, or the first blocking error if failed.
