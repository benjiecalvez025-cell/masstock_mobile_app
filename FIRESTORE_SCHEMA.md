# Firestore Database Schema for Masstock Mobile App

## Collections Overview

This document describes the complete Firestore database structure for the Masstock B2B marketplace platform.

---

## 1. `products` Collection

Stores all product information with pricing and inventory management.

```
products/{productId}
├── id: string (auto-generated)
├── name: string
├── category: string (e.g., "Snacks & Soda", "FMCG Basics")
├── brand: string
├── description: string
├── retailPrice: number (retail/individual price in PHP)
├── wholesalePrice: number (wholesale/bulk price in PHP)
├── stock: number (current inventory)
├── minOrder: number (minimum order quantity)
├── image: string (URL to product image)
├── featured: boolean (true if featured product)
├── sellerId: string (reference to stores/{userId})
├── updatedAt: timestamp
└── (other fields as needed)
```

### Example Document:

```json
{
  "name": "CRACKERS (Bulk Pack) - 12x200g",
  "category": "Snacks & Soda",
  "brand": "Premium Brands",
  "description": "High-quality bulk crackers...",
  "retailPrice": 250,
  "wholesalePrice": 200,
  "stock": 150,
  "minOrder": 1,
  "image": "https://...",
  "featured": true,
  "updatedAt": "2024-05-13T10:30:00Z"
}
```

---

## 2. `carts` Collection

Stores user shopping carts.

```
carts/{userId}
├── items: array
│   └── [index]
│       ├── productId: string
│       ├── name: string
│       ├── category: string
│       ├── price: number
│       ├── quantity: number
│       ├── image: string
│       ├── minOrder: number
│       └── stock: number
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Example Document:

```json
{
  "items": [
    {
      "productId": "prod-123",
      "name": "CRACKERS (Bulk Pack) - 12x200g",
      "category": "Snacks & Soda",
      "price": 240,
      "quantity": 2,
      "image": "https://...",
      "minOrder": 1,
      "stock": 150
    }
  ],
  "createdAt": "2024-05-13T09:00:00Z",
  "updatedAt": "2024-05-13T10:30:00Z"
}
```

---

## 3. `orders` Collection

Stores all purchase orders.

```
orders/{orderId}
├── userId: string (reference to users/{userId})
├── items: array (copy of cart items at order time)
│   └── [index]
│       ├── productId: string
│       ├── name: string
│       ├── price: number
│       ├── quantity: number
│       └── ...
├── total: number (final order total including shipping)
├── status: enum
│   ├── "pending" (initial state)
│   ├── "packing" (seller packing order)
│   ├── "in-transit" (order shipped)
│   ├── "delivered"
│   └── "cancelled"
├── paymentStatus: enum
│   ├── "pending"
│   ├── "paid"
│   └── "completed"
├── paymentMethod: string ("elista", "gcash", "maya", etc.)
├── shippingAddress: string
├── notes: string (optional buyer notes)
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Example Document:

```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "prod-123",
      "name": "CRACKERS (Bulk Pack) - 12x200g",
      "price": 240,
      "quantity": 2
    }
  ],
  "total": 530,
  "status": "packing",
  "paymentStatus": "paid",
  "paymentMethod": "elista",
  "shippingAddress": "Manila, Metro Manila",
  "createdAt": "2024-05-13T10:30:00Z",
  "updatedAt": "2024-05-13T10:35:00Z"
}
```

---

## 4. `stores` Collection

Stores seller/vendor information.

```
stores/{userId}
├── userId: string (reference to users/{userId})
├── name: string (store name)
├── description: string
├── logo: string (URL)
├── level: enum
│   ├── "bronze"
│   ├── "silver"
│   ├── "gold"
│   └── "platinum"
├── rating: number (1-5 stars)
├── credit: number (E-Lista credit balance)
├── totalSales: number (total units sold)
├── totalOrders: number (total orders processed)
├── followers: number
├── verified: boolean
└── createdAt: timestamp
```

### Example Document:

```json
{
  "userId": "seller-123",
  "name": "Nanay Linda's General Store",
  "description": "Trusted wholesale supplier...",
  "logo": "https://...",
  "level": "gold",
  "rating": 4.8,
  "credit": 15000,
  "totalSales": 5240,
  "totalOrders": 142,
  "followers": 1230,
  "verified": true,
  "createdAt": "2023-01-15T00:00:00Z"
}
```

---

## 5. `users` Collection

Stores user account information.

```
users/{userId}
├── id: string (Firebase UID)
├── name: string
├── email: string
├── phone: string
├── ewallet: number (e-wallet balance)
├── store: object (if user is a seller)
│   ├── name: string
│   ├── level: enum
│   ├── credit: number
│   └── rating: number
├── addresses: array (optional shipping addresses)
│   └── [index]
│       ├── city: string
│       ├── address: string
│       └── default: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Example Document:

```json
{
  "id": "user-123",
  "name": "Juan dela Cruz",
  "email": "juan@example.com",
  "phone": "+63912345678",
  "ewallet": 5000,
  "store": {
    "name": "Nanay Linda's Store",
    "level": "gold",
    "credit": 15000,
    "rating": 4.8
  },
  "addresses": [
    {
      "city": "Manila",
      "address": "123 Main St, Manila",
      "default": true
    }
  ],
  "createdAt": "2023-01-10T00:00:00Z"
}
```

---

## 6. `categories` Collection

Stores product categories for browsing.

```
categories/{categoryId}
├── name: string
├── description: string
├── icon: string (URL)
└── productCount: number
```

### Example Document:

```json
{
  "name": "Snacks & Soda",
  "description": "Snacks and beverages in bulk",
  "icon": "https://...",
  "productCount": 245
}
```

---

## 7. `transactions` Collection

Stores financial transaction history.

```
transactions/{transactionId}
├── userId: string
├── type: enum ("credit", "debit", "refund")
├── amount: number
├── description: string
├── orderId: string (reference to orders/{orderId})
├── status: enum ("pending", "completed", "failed")
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Example Document:

```json
{
  "userId": "user-123",
  "type": "debit",
  "amount": 530,
  "description": "Payment for Order MAS-12345",
  "orderId": "order-456",
  "status": "completed",
  "createdAt": "2024-05-13T10:30:00Z"
}
```

---

## 8. `metadata` Collection

Stores app-level metadata and analytics.

```
metadata/inventory_summary
├── totalProducts: number
├── totalStock: number
├── categories: array (list of categories)
├── lastUpdated: timestamp
└── (other analytics as needed)
```

---

## Firestore Security Rules

See `firestore.rules` for the security configuration that:

- Allows public read access to products and categories
- Restricts user data to owner access
- Manages order access based on userId
- Handles seller store management

---

## Indexes

The following composite indexes should be created in Firebase Console:

1. **products** (for product browsing):
   - collection: `products`
   - fields: `category` (Asc), `stock` (Asc), `retailPrice` (Asc)

2. **orders** (for user order history):
   - collection: `orders`
   - fields: `userId` (Asc), `createdAt` (Desc)

3. **products** (for in-stock products):
   - collection: `products`
   - fields: `stock` (Asc), `featured` (Asc)

---

## Data Types

- **timestamp**: Firestore Timestamp (use `Timestamp.now()` in code)
- **array**: Dynamic array of objects
- **enum**: String field with restricted values (not enforced by Firestore, use application logic)
- **number**: Integer or floating-point number
- **string**: UTF-8 text
- **object**: Nested document data
- **boolean**: true/false

---

## Query Examples

### Get In-Stock Products:

```typescript
const q = query(collection(db, "products"), where("stock", ">", 0), limit(20));
```

### Get User Orders (Descending by Date):

```typescript
const q = query(
  collection(db, "orders"),
  where("userId", "==", userId),
  orderBy("createdAt", "desc"),
);
```

### Search Products by Category:

```typescript
const q = query(
  collection(db, "products"),
  where("category", "==", category),
  where("stock", ">", 0),
);
```

---

## Migration Notes

When migrating from Excel data:

1. Use `scripts/import-to-firebase.js` to import initial data
2. Map Excel columns to Firestore fields
3. Ensure all required fields are populated
4. Run data validation after import
5. Set up automatic backups

---

## Best Practices

1. **Use subcollections** for large datasets (e.g., order items as subcollection)
2. **Denormalize data** for frequently accessed relationships (e.g., store info in orders)
3. **Index strategically** to optimize queries
4. **Batch writes** for bulk operations
5. **Use real-time listeners** sparingly to avoid exceeding quota
6. **Archive old data** periodically for cost optimization

---

**Last Updated**: May 13, 2026
**Version**: 1.0.0
