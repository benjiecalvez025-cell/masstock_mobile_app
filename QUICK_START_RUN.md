# Quick Start Guide - Masstock Mobile App

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd c:\Users\DELL\masstock-mobile-app
npm install
```

### Step 2: Start Development Server

```bash
npm start
```

The Expo CLI will start. You'll see output like:

```
›  Expo Go requires internet. Starting dev server...
› Metro Bundler ready
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Web URL: http://localhost:8081
```

### Step 3: Run on Your Device

**Option A: On Physical Device**

1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal with Expo Go app
3. App will load automatically

**Option B: On Web Browser**

```bash
npm run web
```

Browser will open at `http://localhost:8081`

**Option C: On Android Emulator**

```bash
npm run android
```

**Option D: On iOS Simulator** (Mac only)

```bash
npm run ios
```

---

## 📋 Test Account

You can use any valid email and password to create an account:

**Example Test Credentials:**

- Email: `test@example.com`
- Password: `Test@123`

---

## ✅ Testing the Features

### 1. Test Account Creation (5 min)

```
1. Launch app
2. Click "Create Account"
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test@123
   - Confirm: Test@123
4. Click "Create Account"
5. Should see Home screen with welcome message
6. Tap "Profile" tab to see your account
```

### 2. Test Sign In/Out (3 min)

```
1. Go to Profile tab
2. Click "Sign Out"
3. Confirm logout
4. Should see Login screen
5. Enter email and password
6. Click "Sign In"
7. Should return to Home screen
```

### 3. Test Shopping (5 min)

```
1. Go to "Browse" tab
2. Select a category or search
3. Tap product to see details
4. Click "Add to Cart"
5. Go to "Cart" tab
6. Verify items are there
7. See cart total with shipping
```

### 4. Test Checkout (5 min)

```
1. Go to "Cart" tab
2. Tap "Proceed to Checkout"
3. Select payment method
4. Enter shipping address
5. Click "Confirm Order"
6. See success message
7. Go to "Orders" tab to verify order
```

### 5. Test Order Tracking (3 min)

```
1. Go to "Orders" tab
2. Tap on any order
3. See order details, items, timeline
4. See payment and shipping info
5. Verify order status
```

### 6. Test Theme (2 min)

```
1. Go to device Settings
2. Toggle Dark/Light Mode
3. Return to app
4. App should follow system theme
```

---

## 🛠️ Available Commands

```bash
# Start development server (default)
npm start

# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Lint code
npm run lint

# Reset project (if issues)
npm run reset-project
```

---

## 🔧 Troubleshooting

### Issue: "Port 8081 is already in use"

**Solution:**

```bash
# Use a different port
expo start --clear --tunnel
# or
npm start  # and press 's' for web, 'a' for android, 'i' for ios
```

### Issue: "Firebase not initialized"

**Solution:**

- Ensure Firebase credentials are in `.env.local`
- Check Firebase project ID: `masstock-app`
- Verify internet connection

### Issue: "Module not found"

**Solution:**

```bash
npm install
npm run reset-project
npm start
```

### Issue: "App won't run on emulator"

**Solution:**

```bash
# Clear metro bundler cache
npm start -- --clear

# Or reset everything
rm -rf node_modules
npm install
npm start
```

### Issue: "Authentication fails"

**Solution:**

1. Verify Firebase rules are deployed: `npx firebase deploy --only firestore:rules`
2. Check `.env.local` has Firebase credentials
3. Try signing up with new email instead

---

## 📁 Project Files You Created

**Authentication:**

- ✅ `app/auth/welcome.tsx` - Welcome screen
- ✅ `app/auth/signup.tsx` - Create account
- ✅ `app/auth/login.tsx` - Sign in
- ✅ `app/auth/_layout.tsx` - Auth navigation

**Profile:**

- ✅ `app/(tabs)/profile.tsx` - User profile

**Enhanced:**

- ✅ `app/_layout.tsx` - Auth routing
- ✅ `context/app-context.tsx` - Auth + data state
- ✅ `app/(tabs)/_layout.tsx` - Added profile tab
- ✅ `app/(tabs)/index.tsx` - Home with welcome

**Documentation:**

- ✅ `AUTH_FEATURES.md` - Authentication guide
- ✅ `FEATURE_SUMMARY.md` - Complete feature list
- ✅ `QUICK_START.md` - This file!

---

## 🎯 What You Can Do Now

1. **Create Customer Accounts** ✅
   - Sign up with email
   - Auto login after signup
   - Profile management

2. **Browse Products** ✅
   - Search by category
   - View product details
   - See pricing

3. **Shopping Cart** ✅
   - Add items
   - Update quantities
   - Calculate totals

4. **Checkout** ✅
   - Select payment method
   - Enter shipping address
   - Create order

5. **Track Orders** ✅
   - View order history
   - See order status
   - View timeline

6. **Manage Account** ✅
   - View profile
   - See E-wallet balance
   - Sign out

---

## 📊 Feature Status

| Feature            | Status   | Notes                     |
| ------------------ | -------- | ------------------------- |
| Account Creation   | ✅ Ready | Firebase Auth + Firestore |
| Sign In / Sign Out | ✅ Ready | Session persistence       |
| User Profile       | ✅ Ready | Display account info      |
| Product Browse     | ✅ Ready | Categories + search       |
| Shopping Cart      | ✅ Ready | Real-time Firestore sync  |
| Checkout           | ✅ Ready | Payment methods           |
| Order Tracking     | ✅ Ready | Status + timeline         |
| E-Wallet           | ✅ Ready | Balance tracking          |
| Store Management   | ✅ Ready | Seller features           |
| Dark/Light Theme   | ✅ Ready | Auto detection            |

---

## 💡 Pro Tips

1. **Development**: Use `npm start` and scan QR with Expo Go for fastest testing
2. **Debugging**: Check browser DevTools in web mode
3. **Reset**: Use `npm run reset-project` if you encounter issues
4. **Performance**: App uses Firestore real-time sync for instant updates
5. **Security**: All data is protected by Firebase rules

---

## 🎊 You're Ready!

All features are implemented and ready to test. Just run:

```bash
npm start
```

Then:

1. Scan QR with Expo Go, or
2. Press 'w' for web, or
3. Press 'a' for Android, or
4. Press 'i' for iOS

**Enjoy your fully functional Masstock marketplace app!** 🚀

---

## ❓ Need Help?

Check these files for more info:

- `AUTH_FEATURES.md` - Authentication details
- `FEATURE_SUMMARY.md` - Complete feature overview
- `IMPLEMENTATION_GUIDE.md` - Code examples
- `QUICK_START.md` - This file

Or start debugging by checking terminal output for errors.
