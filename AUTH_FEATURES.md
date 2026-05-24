# Authentication & Account Features - Masstock Mobile App

## Overview

Complete customer account system with Firebase Authentication integration. Users can now create accounts, sign in, manage their profile, and access personalized features.

## Features Implemented

### 1. **Welcome Screen** (`app/auth/welcome.tsx`)

- Beautiful onboarding experience
- Feature highlights:
  - 🛍️ Wholesale Pricing
  - 💳 E-Wallet
  - 📍 Order Tracking
  - 🏪 Store Management
- Call-to-action buttons: Sign Up, Sign In, Continue as Guest
- Dark/Light theme support

### 2. **Sign Up Screen** (`app/auth/signup.tsx`)

- Complete account creation flow
- **Form Fields:**
  - First Name
  - Last Name
  - Email (with validation)
  - Password (min 6 characters)
  - Confirm Password
- **Features:**
  - Real-time validation
  - Error messages
  - Password strength checking
  - Email format validation
  - Terms of Service link
  - Existing user login link
- **Backend Integration:**
  - Firebase Authentication (email/password)
  - Firestore user document creation
  - Automatic user profile setup
  - E-wallet initialization (₱0)
  - Loyalty points initialization

### 3. **Sign In Screen** (`app/auth/login.tsx`)

- Fast and secure login
- **Form Fields:**
  - Email
  - Password
- **Features:**
  - Email validation
  - Error handling for:
    - User not found
    - Wrong password
    - Too many login attempts
  - Forgot password link (placeholder for future implementation)
  - Guest access option
  - New user signup link
- **Backend Integration:**
  - Firebase Authentication
  - Firestore user data retrieval
  - Session management

### 4. **Profile Screen** (`app/(tabs)/profile.tsx`)

- Comprehensive user account management
- **Display Sections:**
  - **Profile Header:** User avatar, name, email
  - **Account Information:**
    - Email address
    - Phone number
    - E-Wallet balance
  - **Settings Options:**
    - Edit Profile
    - Addresses (shipping)
    - Payment Methods
    - Privacy Settings
    - Help & Support
  - **Sign Out Button**
- **Unauthenticated State:** Prompts to sign in
- **Features:**
  - Beautiful card-based layout
  - Real-time data display
  - Logout confirmation dialog
  - Loading states
  - Theme support

### 5. **Authentication Context** (`context/app-context.tsx`)

Enhanced with Firebase Auth integration:

**New State:**

- `isAuthenticated: boolean` - Whether user is logged in
- `isAuthLoading: boolean` - Loading state while checking auth

**New Methods:**

- `setUser(user)` - Update current user
- `logout()` - Sign out using Firebase Auth

**Features:**

- Automatic auth state detection on app start
- Firebase listener for persistent login
- Error handling and messages
- Loading indicators

**Auth State Listener:**

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      setIsAuthenticated(true);
      // Load user data
    } else {
      setIsAuthenticated(false);
    }
    setIsAuthLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### 6. **Navigation Flow** (`app/_layout.tsx`)

Dynamic routing based on authentication status:

```
┌─ app/_layout.tsx (Root Layout)
│  ├─ if (isAuthLoading)
│  │  └─ Show Loading Spinner
│  ├─ if (isAuthenticated)
│  │  └─ Show (tabs)
│  │     ├─ Home
│  │     ├─ Browse
│  │     ├─ Orders
│  │     ├─ My Store
│  │     ├─ Cart
│  │     └─ Profile ← NEW
│  └─ else
│     └─ Show auth/welcome
│        ├─ Welcome
│        ├─ Sign Up
│        └─ Sign In
```

### 7. **Tabs Navigation** (`app/(tabs)/_layout.tsx`)

Added profile tab:

- **Icon:** person.fill
- **Title:** Profile
- **Position:** Last tab (after Cart)

### 8. **Auth Layout** (`app/auth/_layout.tsx`)

Stack navigation for authentication screens:

- Welcome (entry point)
- Sign Up
- Sign In

## User Journey

### First-Time User (New Account)

```
Welcome Screen
    ↓
    Create Account
    ↓
Sign Up Form
    ↓
Firebase Auth (Email/Password)
    ↓
Create Firestore User Doc
    ↓
Home Screen
```

### Returning User

```
Welcome Screen
    ↓
    Sign In
    ↓
Sign In Form
    ↓
Firebase Auth Verification
    ↓
Load User Data from Firestore
    ↓
Home Screen
```

### Guest User

```
Welcome Screen
    ↓
    Continue as Guest
    ↓
Home Screen (Guest Mode)
    - Can browse products
    - Cannot checkout
    - Can view pricing
```

### Logout Flow

```
Profile Screen
    ↓
    Sign Out
    ↓
Confirmation Dialog
    ↓
Firebase Sign Out
    ↓
Clear Local State
    ↓
Welcome Screen
```

## Firestore User Document Structure

When a user signs up, the following document is created in `users` collection:

```typescript
{
  id: string; // Firebase UID
  firstName: string; // User's first name
  lastName: string; // User's last name
  name: string; // Full name
  email: string; // Email address
  phone: string; // Phone number (empty initially)
  emailVerified: boolean; // Email verification status
  createdAt: ISO8601; // Account creation timestamp
  ewallet: number; // E-wallet balance (starts at 0)
  elistaCredit: number; // E-Lista credit (starts at 0)
  loyaltyPoints: number; // Loyalty points (starts at 0)
  store: null; // Seller store (null until activated)
  isActive: boolean; // Account status
}
```

## Firebase Rules for Auth

Security rules configured to:

- Allow public read access to products
- Require authentication for user-specific data
- Allow users to read/write only their own data
- Allow owners to manage their orders and carts

## Testing the Authentication Flow

### 1. Test Sign Up

1. Launch app
2. Click "Create Account"
3. Fill in all fields:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test@123
4. Click "Create Account"
5. Should navigate to Home screen

### 2. Test Sign In

1. Sign out from Profile screen
2. Click "Sign In"
3. Enter email and password
4. Should navigate to Home screen

### 3. Test Guest Access

1. From Welcome screen, click "Continue as Guest"
2. Should navigate to Home screen with limited features

### 4. Test Profile

1. After signing in, tap "Profile" tab
2. Should see:
   - User name and email
   - Account information
   - Settings options
   - Sign Out button

### 5. Test Auth Persistence

1. Sign in with valid credentials
2. Close and reopen app
3. Should still be logged in (no Welcome screen)

## Error Handling

**Sign Up Errors:**

- "Email is already registered" - Email exists
- "Password is too weak" - Password doesn't meet requirements
- "Invalid email format" - Email format incorrect

**Sign In Errors:**

- "Email not registered" - User doesn't exist
- "Incorrect password" - Wrong password
- "Too many login attempts" - Account temporarily locked

## Future Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Verify before full access

2. **Password Reset**
   - Forgot password flow
   - Email verification
   - New password setup

3. **Phone Verification**
   - OTP verification
   - Phone number update

4. **Social Login**
   - Google Sign In
   - Facebook Login
   - Apple Sign In

5. **Profile Management**
   - Edit profile information
   - Update phone number
   - Change password
   - Profile picture upload

6. **Address Management**
   - Add multiple addresses
   - Set default address
   - Edit/delete addresses

7. **Two-Factor Authentication**
   - SMS or email 2FA
   - App-based authenticator

## Dependencies

- `firebase/auth` - Authentication
- `firebase/firestore` - User data storage
- `expo-router` - Navigation
- `react-native` - UI components
- `@react-navigation/native` - Navigation provider

## Files Created/Modified

### New Files:

- `app/auth/welcome.tsx` - Welcome/onboarding screen
- `app/auth/signup.tsx` - User account creation
- `app/auth/login.tsx` - User sign in
- `app/auth/_layout.tsx` - Auth navigation stack
- `app/(tabs)/profile.tsx` - User profile management

### Modified Files:

- `app/_layout.tsx` - Added auth routing logic
- `context/app-context.tsx` - Added Firebase auth integration
- `app/(tabs)/_layout.tsx` - Added profile tab

## Summary

The authentication system is now fully integrated with Firebase, providing:

- ✅ Secure user account creation
- ✅ Email/password authentication
- ✅ Persistent login sessions
- ✅ User profile management
- ✅ Firestore user data storage
- ✅ Account information display
- ✅ Sign out functionality
- ✅ Guest access option
- ✅ Beautiful, intuitive UI
- ✅ Comprehensive error handling
- ✅ Dark/Light theme support

Users can now create accounts, sign in, manage their profiles, and access all the marketplace features with proper authentication!
