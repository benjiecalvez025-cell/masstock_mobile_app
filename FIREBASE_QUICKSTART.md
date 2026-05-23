# Masstock Firebase Quick Start

## 📋 Summary

Your Masstock app now has everything ready for Firebase integration with 2,116 imported products.

## ✅ What's Been Set Up

### Files Created:

1. **`services/firebase.config.ts`** - Firebase initialization for the mobile app
2. **`services/firestore-service.ts`** - Database query functions for products, users, and metadata
3. **`scripts/import-to-firebase.js`** - Node.js script to import Excel data to Firestore
4. **`scripts/analyze-excel.js`** - Utility to inspect Excel file structure
5. **`FIREBASE_SETUP_GUIDE.md`** - Complete setup instructions
6. **`FIREBASE_BACKEND_MIGRATION.md`** - Backend API migration guide

### Excel Data Analyzed:

- ✅ 2,116 products imported
- ✅ Columns: code, name, price, wholesale price, quantity per box, stock, units of measure, department, cost
- ✅ All products ready for import to Firestore

## 🚀 Quick Start (Next Steps)

### 1. Create Firebase Project (5 minutes)

```
1. Go to https://console.firebase.google.com
2. Create new project "masstock-app"
3. Enable Firestore Database (Southeast Asia)
4. Enable Authentication (Email/Password)
5. Get Firebase config from Project Settings
```

### 2. Configure Mobile App (.env.local)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxxxx
```

### 3. Download Service Account Key (2 minutes)

```
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as firebase-service-account-key.json
4. Place in project root (add to .gitignore!)
```

### 4. Run Import Script (1 minute)

```powershell
# On Windows PowerShell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = "C:\path\to\firebase-service-account-key.json"
node scripts/import-to-firebase.js
```

Expected output:

```
🚀 Starting Masstock Firebase Import...
✅ Loaded 2116 products from Excel
💾 Committing data to Firestore...
✅ Successfully imported 2116 products!
```

### 5. Verify in Firebase Console

- Go to Firestore Database
- You should see "products" collection with 2,116 documents
- Each product has: code, name, category, brand, pricing, stock, etc.

## 📱 Using Firestore in Your App

The mobile app is ready to use Firestore. Example usage:

```typescript
// In any screen component
import {
  getProducts,
  getProductByCode,
  searchProducts,
} from "@/services/firestore-service";

// Get all products
const products = await getProducts(20, 0);

// Get single product
const product = await getProductByCode("8998666004215");

// Search products
const results = await searchProducts("coffee");

// Get by category
const beverages = await getProductsByCategory("Beverages");
```

## 🔧 Backend API Migration

Your Next.js backend also needs updating to use Firebase:

See: `FIREBASE_BACKEND_MIGRATION.md` for complete instructions.

Quick steps:

1. Install firebase-admin: `npm install firebase-admin`
2. Create `lib/firebase-admin.ts` (template provided)
3. Migrate API endpoints to use Firestore queries
4. Update authentication to use Firebase Auth
5. Test all endpoints

## 📊 Data Structure

After import, your Firestore contains:

```javascript
// products collection
{
  code: "8998666004215",
  name: "KOPIKO COFFEE BLANCA TWN BUY 20 GWT 2 FREE",
  category: "Beverages",
  brand: "KOPIKO",
  retailPrice: 278.93,
  wholesalePrice: 1627.78,
  stock: 10000,
  qtyPerBox: 6,
  uom: "PACK",
  uom2: "BOX",
  rating: 4.5,
  createdAt: timestamp,
  // ... more fields
}
```

## 🔒 Security Rules

Set these rules in Firestore Console → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products readable by all
    match /products/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Users access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Orders belong to users
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Public metadata
    match /metadata/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🐛 Troubleshooting

**Q: Import script says "FIREBASE_SERVICE_ACCOUNT_PATH not set"**

- A: Set the environment variable with full path to your service account JSON file

**Q: "Permission denied" error during import**

- A: Check Firebase Console → IAM & Admin, ensure service account has Editor role

**Q: Products showing in console but not in app**

- A: Verify `.env.local` has correct Firebase config
- A: Check Firestore security rules allow reads

**Q: Import is slow**

- A: Normal for 2,116 products (30-60 seconds)
- A: Don't interrupt the process

## 📝 Configuration Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled (Southeast Asia region)
- [ ] Authentication enabled (Email/Password provider)
- [ ] Storage enabled (optional for product images)
- [ ] `.env.local` filled with Firebase config
- [ ] Service account key downloaded and placed in project
- [ ] `firebase-service-account-key.json` added to `.gitignore`
- [ ] Import script run successfully (2,116 products in Firestore)
- [ ] Backend API endpoints updated to use Firestore
- [ ] Firestore security rules set
- [ ] Mobile app tested with real product data

## 📚 Documentation Files

- **FIREBASE_SETUP_GUIDE.md** - Complete Firebase setup instructions
- **FIREBASE_BACKEND_MIGRATION.md** - Backend API migration guide
- **services/firebase.config.ts** - Mobile app Firebase configuration
- **services/firestore-service.ts** - Firestore query utilities
- **scripts/import-to-firebase.js** - Excel to Firestore importer

## 🎯 Next Steps

1. ✅ **CREATE FIREBASE PROJECT** (you need to do this)
2. ✅ **DOWNLOAD SERVICE ACCOUNT KEY** (you need to do this)
3. ✅ **RUN IMPORT SCRIPT** (you can do this once you have #1 and #2)
4. Update backend API endpoints to use Firestore
5. Test product browsing with real data
6. Implement user authentication with Firebase Auth
7. Set up cart and orders in Firestore
8. Test full checkout flow with real data

## 💡 Pro Tips

- Firebase Firestore has a free tier (1GB storage, 50k reads/day)
- For 2,116 products, queries are lightning fast
- Use Firestore listeners for real-time updates when needed
- Composite indexes are auto-created for complex queries
- Keep API keys in `.env` files, never commit them to Git

## 🚨 Important Security Notes

1. **Never commit `firebase-service-account-key.json` to Git**
2. **Keep API keys secret** - use environment variables
3. **Validate user input** on backend before Firestore operations
4. **Use security rules** to protect user data
5. **Enable audit logging** in Firebase Console

---

**You're ready to go!** Start with creating your Firebase project, then come back and run the import script.

For detailed instructions, see: **FIREBASE_SETUP_GUIDE.md**
