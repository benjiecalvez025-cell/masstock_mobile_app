# Deploy Firestore Security Rules

The `firestore.rules` file contains the security rules needed for your Masstock app to work properly.

## Prerequisites

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

## Deploy to Firebase

1. Run the deployment command:

```bash
firebase deploy --only firestore:rules
```

2. You should see output like:

```
i  deploying firestore...
✔  firestore.rules deployed successfully
```

## Rules Summary

The security rules in `firestore.rules` allow:

- **Products Collection**: Public read access (anyone can browse products)
- **Users Collection**: Authenticated users can read/write their own data
- **Orders Collection**: Authenticated users can create and manage their own orders
- **Carts Collection**: Authenticated users can manage their own cart
- **Categories Collection**: Public read access
- **Transactions Collection**: Read-only (managed by backend)

## Troubleshooting

If deployment fails:

1. Make sure you're logged in: `firebase login`
2. Verify project: `firebase projects:list`
3. Set correct project: `firebase use <project-id>`
4. Check rule syntax in Firebase Console: **Firestore Database** → **Rules** tab

## Next Steps

After deploying these rules:

1. Your app should be able to read products without permission errors
2. Users will need to authenticate to create orders and manage their cart
3. Implement sign-in in your app to test authenticated features
