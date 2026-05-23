# Firebase Setup Guide for Masstock App

This guide will help you set up Firebase for the Masstock mobile app and import your Excel inventory data.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: **masstock-app**
4. Accept terms and click **"Continue"**
5. Disable Google Analytics (optional) and click **"Create project"**
6. Wait for project creation to complete

## Step 2: Enable Required Services

### Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Select region: **Southeast Asia (Singapore)** for best performance
4. Choose **Start in production mode**
5. Click **"Create"**

### Authentication

1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** provider
4. Enable **Anonymous** sign-in (optional, for testing)

### Storage (Optional, for product images)

1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose **Southeast Asia (Singapore)** region
4. Set default rules and click **"Done"**

## Step 3: Get Firebase Configuration

### For Mobile App:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Under **General** tab, scroll to **Your apps**
3. Select or create a **Web** app
4. Copy the configuration object
5. Update `.env.local` in your mobile app:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxxxx
```

### For Backend (Data Import):

1. In Firebase Console, go to **Project Settings**
2. Go to **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Save the JSON file as: `firebase-service-account-key.json`
5. Move it to your project root (or a secure location)
6. **IMPORTANT**: Add to `.gitignore` to prevent uploading to GitHub:
   ```
   firebase-service-account-key.json
   *.json
   ```

## Step 4: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

## Step 5: Run the Data Import Script

### Using Windows PowerShell:

```powershell
# Set the service account path
$env:FIREBASE_SERVICE_ACCOUNT_PATH = "C:\path\to\firebase-service-account-key.json"

# Run the import script
node scripts/import-to-firebase.js
```

### Using Command Prompt:

```cmd
set FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\to\firebase-service-account-key.json
node scripts/import-to-firebase.js
```

### Using Git Bash:

```bash
export FIREBASE_SERVICE_ACCOUNT_PATH="/c/path/to/firebase-service-account-key.json"
node scripts/import-to-firebase.js
```

**Expected output:**

```
🚀 Starting Masstock Firebase Import...

📂 Reading Excel file: C:\Users\DELL\Downloads\Inventory_Export.xlsx
✅ Loaded 2116 products from Excel

📦 Processing product data...

💾 Committing data to Firestore...
✅ Successfully imported 2116 products!

📊 Import Statistics:
  • Total products: 2116
  • Collection: products
  • Status: Ready for use

✨ Import completed successfully!
```

## Step 6: Verify Data in Firebase Console

1. Go to Firebase Console → **Firestore Database**
2. You should see a **"products"** collection with 2,116 documents
3. Each document should have:
   - `code` (product code)
   - `name` (product name)
   - `wholesalePrice` (wholesale selling price)
   - `retailPrice` (retail price)
   - `stock` (inventory quantity)
   - `category` (auto-categorized)
   - And more...

## Step 7: Update Backend API

Your Next.js backend needs to be updated to fetch data from Firestore instead of PostgreSQL.

See: [Backend Firebase Migration Guide](../FIREBASE_BACKEND_MIGRATION.md)

## Step 8: Update Mobile App

The mobile app is already configured to use Firebase:

- `services/firebase.config.ts` - Firebase initialization
- `context/app-context.tsx` - Ready to integrate Firestore queries

## Firestore Database Structure

After import, your Firestore will have:

```
masstock-project/
├── products/ (2,116 documents)
│   ├── 8998666004215 (product code as document ID)
│   │   ├── code: "8998666004215"
│   │   ├── name: "KOPIKO COFFEE BLANCA..."
│   │   ├── category: "Beverages"
│   │   ├── brand: "KOPIKO"
│   │   ├── retailPrice: 278.93
│   │   ├── wholesalePrice: 1627.78
│   │   ├── stock: 10000
│   │   ├── qtyPerBox: 6
│   │   ├── uom: "PACK"
│   │   ├── uom2: "BOX"
│   │   ├── rating: 4.5
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   └── ... (other fields)
│   ├── 8998666004216 (next product)
│   └── ...
│
├── users/ (will be created on signup)
│   ├── userId1
│   │   ├── email: "user@example.com"
│   │   ├── name: "John Doe"
│   │   ├── createdAt: timestamp
│   │   └── ...
│   └── ...
│
├── orders/ (will be created on checkout)
│   ├── orderId1
│   │   ├── userId: "user123"
│   │   ├── items: [...]
│   │   ├── total: 5000
│   │   ├── status: "pending"
│   │   └── ...
│   └── ...
│
└── metadata/
    └── inventory_summary
        ├── totalProducts: 2116
        ├── categories: [...]
        ├── lastImportDate: timestamp
        └── status: "completed"
```

## Firestore Security Rules

**Important**: Set up proper security rules to protect your data.

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products are publicly readable
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Only admin SDK can write
    }

    // Users can only access their own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Orders belong to users
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Cart items belong to users
    match /carts/{userId}/items/{itemId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Metadata is read-only for clients
    match /metadata/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

3. Click **"Publish"**

## Troubleshooting

### Error: "FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set"

- Make sure you set the environment variable with the full path to your service account key
- On Windows: Use backslashes `C:\path\to\key.json` or forward slashes `C:/path/to/key.json`

### Error: "Service account file not found"

- Check that the file path is correct
- Verify the file exists and you have read permissions

### Error: "Permission denied" during import

- Make sure your service account has Firestore write permissions
- In Firebase Console, go to **IAM & Admin** and ensure your service account has "Editor" role

### Slow import on large datasets

- This is normal for 2,116 documents (usually takes 30-60 seconds)
- Don't interrupt the script while it's running

### Products not showing in app

- Verify data is in Firestore Console
- Check that your Firebase config in `.env.local` is correct
- Check browser console for Firebase errors
- Verify Firestore security rules allow reads

## What's Next?

1. ✅ Firebase setup and data import
2. 🔄 Update backend API to use Firestore
3. 🔄 Test product browsing with real data
4. 🔄 Implement user authentication with Firebase Auth
5. 🔄 Set up cart and orders in Firestore
6. 🔄 Test full checkout flow

See the main project README for next steps.
