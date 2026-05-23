# Firebase Backend Migration Guide

This guide explains how to update your Next.js backend to use Firebase Firestore instead of PostgreSQL/Prisma.

## Overview

**Before (PostgreSQL + Prisma):**

```
Mobile App → Next.js API → Prisma ORM → PostgreSQL
```

**After (Firebase):**

```
Mobile App → Next.js API → Firebase Admin SDK → Firestore
```

## Step 1: Install Firebase Admin SDK

```bash
cd masstock-backend
npm install firebase-admin
```

## Step 2: Set Up Firebase Admin Configuration

Create `lib/firebase-admin.ts`:

```typescript
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
  console.warn(
    "⚠️  Firebase service account not configured. Using default credentials.",
  );
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
} else {
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf-8"),
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
```

## Step 3: Update Environment Variables

Update `.env.local` in your backend:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account-key.json

# Keep existing settings
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:8082
```

## Step 4: Migrate API Endpoints

Here's how to convert your existing Prisma endpoints to Firestore:

### Example 1: Get All Products

**Before (Prisma):**

```typescript
// api/products.ts
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const products = await prisma.product.findMany({
    take: 20,
    skip: 0,
  });
  res.json(products);
}
```

**After (Firestore):**

```typescript
// api/products.ts
import { db } from "@/lib/firebase-admin";

export default async function handler(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const snapshot = await db
      .collection("products")
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Example 2: Get Single Product by Code

**Before (Prisma):**

```typescript
const product = await prisma.product.findUnique({
  where: { code: productCode },
});
```

**After (Firestore):**

```typescript
const doc = await db.collection("products").doc(productCode).get();
const product = doc.exists ? { id: doc.id, ...doc.data() } : null;
```

### Example 3: Create User on Signup

**Before (Prisma + bcrypt):**

```typescript
import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
  },
});
```

**After (Firebase Auth):**

```typescript
// Firebase handles password hashing and storage
const userRecord = await admin.auth().createUser({
  email,
  password,
  displayName: name,
});

// Store additional user data in Firestore
await db.collection("users").doc(userRecord.uid).set({
  email,
  name,
  createdAt: admin.firestore.Timestamp.now(),
  role: "user",
  profile: {},
});
```

### Example 4: Login/Authenticate

**Before (JWT with Prisma):**

```typescript
const user = await prisma.user.findUnique({
  where: { email },
});

if (user && bcrypt.compareSync(password, user.password)) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
}
```

**After (Firebase Auth):**

```typescript
import axios from "axios";

try {
  // Verify with Firebase
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      email,
      password,
      returnSecureToken: true,
    },
  );

  res.json({
    token: response.data.idToken,
    refreshToken: response.data.refreshToken,
  });
} catch (error) {
  res.status(401).json({ error: "Invalid credentials" });
}
```

## Step 5: Complete API Migration Template

Here's a template for migrating all common endpoints:

```typescript
// api/auth/signup.ts
import { db, auth } from "@/lib/firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, name } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Store additional user data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      createdAt: new Date(),
      role: "user",
      avatar: null,
      phone: null,
      address: null,
    });

    res.json({
      success: true,
      userId: userRecord.uid,
      message: "User created successfully",
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

```typescript
// api/products/[code].ts
import { db } from "@/lib/firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code } = req.query;

  try {
    const doc = await db
      .collection("products")
      .doc(code as string)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

```typescript
// api/cart/add.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = verifyToken(req); // Get from JWT token
    const { productCode, quantity } = req.body;

    // Add to user's cart subcollection
    const cartItemRef = db
      .collection("users")
      .doc(userId)
      .collection("cart")
      .doc(productCode);

    await cartItemRef.set(
      {
        productCode,
        quantity,
        addedAt: new Date(),
      },
      { merge: true },
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

```typescript
// api/orders/create.ts
import { db } from "@/lib/firebase-admin";
import { verifyToken } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userId = verifyToken(req);
    const { items, total, paymentMethod, deliveryAddress } = req.body;

    // Create order document
    const orderRef = db.collection("orders").doc(); // Auto-generate ID

    await orderRef.set({
      userId,
      items,
      total,
      paymentMethod,
      deliveryAddress,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear user's cart
    const cartDocs = await db
      .collection("users")
      .doc(userId)
      .collection("cart")
      .get();

    for (const doc of cartDocs.docs) {
      await doc.ref.delete();
    }

    res.json({
      success: true,
      orderId: orderRef.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

## Step 6: Update Authentication Middleware

Create `lib/auth.ts`:

```typescript
import * as admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export function verifyToken(req: NextApiRequest): string {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (userId: string) => Promise<void>,
) {
  try {
    const userId = verifyToken(req);
    await handler(userId);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
```

## Step 7: Firestore Database Structure

Ensure your Firestore has these collections:

```
masstock/
├── products/ (imported from Excel)
├── users/
│   ├── {userId}
│   │   ├── email
│   │   ├── name
│   │   ├── phone
│   │   ├── avatar
│   │   ├── createdAt
│   │   ├── cart/ (subcollection)
│   │   │   ├── {productCode}
│   │   │   │   ├── quantity
│   │   │   │   └── addedAt
│   │   └── addresses/ (subcollection)
│   │       └── {addressId}
│   │           ├── name
│   │           ├── street
│   │           ├── city
│   │           └── zipCode
├── orders/
│   ├── {orderId}
│   │   ├── userId
│   │   ├── items
│   │   ├── total
│   │   ├── status
│   │   ├── createdAt
│   │   └── updatedAt
└── payments/
    ├── {paymentId}
    │   ├── orderId
    │   ├── amount
    │   ├── method
    │   ├── status
    │   └── timestamp
```

## Step 8: Testing

Test your migrated endpoints:

```bash
# Test get products
curl http://localhost:3001/api/products

# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John"}'

# Test get product
curl http://localhost:3001/api/products/8998666004215
```

## Migration Checklist

- [ ] Install firebase-admin
- [ ] Create firebase-admin.ts initialization file
- [ ] Update .env.local with Firebase config
- [ ] Update auth endpoints (signup, login)
- [ ] Update product endpoints (get all, get one, search)
- [ ] Update cart endpoints (add, remove, get)
- [ ] Update orders endpoints (create, get, list)
- [ ] Update user endpoints (profile, update)
- [ ] Create/update security rules in Firestore
- [ ] Test all API endpoints
- [ ] Update mobile app API URLs if needed
- [ ] Remove Prisma dependencies

## Removing Prisma

Once fully migrated to Firebase:

```bash
npm uninstall @prisma/client
npm uninstall prisma
rm -rf prisma/ # Remove schema directory
```

## Common Firestore Patterns

### Query with Filters

```typescript
const snapshot = await db
  .collection("products")
  .where("category", "==", "Beverages")
  .where("stock", ">", 0)
  .limit(20)
  .get();
```

### Pagination

```typescript
const snapshot = await db
  .collection("products")
  .orderBy("createdAt", "desc")
  .limit(20)
  .get();

const lastDoc = snapshot.docs[snapshot.docs.length - 1];
const nextPage = await db
  .collection("products")
  .orderBy("createdAt", "desc")
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

### Transactions

```typescript
const transaction = await db.transaction();
try {
  transaction.update(userRef, { credits: increment(-amount) });
  transaction.set(orderRef, orderData);
  await transaction.commit();
} catch (error) {
  console.error("Transaction failed:", error);
}
```

## Troubleshooting

- **Permission denied errors**: Check your Firestore security rules
- **Token verification fails**: Ensure Firebase initialization is correct
- **Slow queries**: Add composite indexes in Firestore for complex queries
- **Data not syncing**: Check network connectivity and Firebase status

See [Firebase Backend Migration Guide](../FIREBASE_BACKEND_MIGRATION.md) for the complete migration.
