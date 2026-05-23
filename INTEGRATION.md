# Mobile App to Backend Integration Guide

This guide walks through connecting the Masstock mobile app to the backend API.

## ✅ Prerequisites

1. **Backend API running** (see masstock-backend setup in README.md)
   - Backend should be running on `http://localhost:3001`
   - Database should be initialized: `npx prisma db push`

2. **Mobile app dependencies installed**
   ```bash
   cd masstock-mobile-app
   npm install
   ```

## 🔧 Configuration

### 1. Environment Setup

The `.env.local` file is already configured:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

For production, update this to your deployed backend URL:

```env
EXPO_PUBLIC_API_URL=https://api.masstock.com/api
```

## 📱 API Service Integration

### API Service (`services/api-service.ts`)

The API service handles:

- ✅ All HTTP requests to backend
- ✅ Automatic JWT token injection
- ✅ Token refresh on 401 errors
- ✅ Error handling and standardized responses

### App Context Integration

The `AppProvider` now includes:

**Authentication Methods:**

- `login(email, password)` - User login
- `signup(email, password, firstName, lastName)` - New user registration
- `logout()` - Clear session

**Data Fetching:**

- `fetchCart()` - Get current cart
- `fetchOrders()` - Get user orders
- `fetchProfile()` - Get user profile

**Cart Operations (API):**

- `addToCartAPI(productId, quantity)` - Add item from backend
- `removeFromCartAPI(itemId)` - Remove item from backend

**Order Operations:**

- `createOrder(paymentMethod, shippingAddress)` - Create new order
- `processPayment(orderId, method)` - Process payment

## 🚀 Usage Examples

### Login Flow

```typescript
import { useApp } from '../context/app-context';

export function LoginScreen() {
  const { login, loading, error } = useApp();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Automatically redirected on success
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    // Your login UI
  );
}
```

### Add to Cart

```typescript
import { useApp } from '../context/app-context';

export function ProductCard() {
  const { addToCartAPI } = useApp();

  const handleAddToCart = async () => {
    await addToCartAPI('product-id-123', 2);
  };

  return (
    // Your product UI with add to cart button
  );
}
```

### Fetch Orders

```typescript
import { useApp } from '../context/app-context';
import { useEffect } from 'react';

export function OrdersScreen() {
  const { fetchOrders, orders, loading } = useApp();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    // Your orders list
  );
}
```

## 🔗 API Endpoint Integration

The following app screens should integrate with these backend endpoints:

| Screen | Feature           | Endpoint                                    | Method |
| ------ | ----------------- | ------------------------------------------- | ------ |
| Home   | Featured products | `GET /api/products?limit=10`                | GET    |
| Browse | Search & filter   | `GET /api/products?search=...&category=...` | GET    |
| Browse | Add to cart       | `POST /api/cart`                            | POST   |
| Cart   | Get cart items    | `GET /api/cart`                             | GET    |
| Cart   | Remove item       | `DELETE /api/cart/{id}`                     | DELETE |
| Cart   | Update quantity   | `PUT /api/cart/{id}`                        | PUT    |
| Cart   | Checkout          | `POST /api/orders`                          | POST   |
| Orders | Get orders        | `GET /api/orders`                           | GET    |
| Orders | Track order       | `GET /api/orders/{id}`                      | GET    |

## 🧪 Testing API Calls

### Using Insomnia or Postman

1. **Start backend:**

   ```bash
   cd masstock-backend
   npm run dev
   ```

2. **Test signup:**

   ```
   POST http://localhost:3001/api/auth/signup
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

3. **Test login:**

   ```
   POST http://localhost:3001/api/auth/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

4. **Test get products (with token):**
   ```
   GET http://localhost:3001/api/products
   Authorization: Bearer <token_from_login>
   ```

## 🔐 Token Management

Tokens are automatically:

- ✅ Stored in AsyncStorage after login
- ✅ Injected in all API requests
- ✅ Cleared on logout
- ✅ Refreshed on 401 response

## ❌ Error Handling

The app context provides `error` state:

```typescript
const { error } = useApp();

if (error) {
  return <Text>Error: {error}</Text>;
}
```

## 🔄 State Synchronization

### Local State vs API

**Use API methods when:**

- Fetching real data from backend
- Creating/updating data
- Multi-user scenarios

**Use local methods when:**

- Optimistic UI updates
- Temporary changes before submission
- Offline-first patterns

## 📊 Debugging

### Enable Network Logging

Add to `api-service.ts` for debugging:

```typescript
this.api.interceptors.request.use((config) => {
  console.log("API Request:", config.url, config.method);
  return config;
});

this.api.interceptors.response.use((response) => {
  console.log("API Response:", response.status, response.data);
  return response;
});
```

## 🚀 Deployment

### Environment Variables for Production

```env
EXPO_PUBLIC_API_URL=https://api.masstock.com/api
```

### Backend Deployment

Deploy Next.js backend to:

- Vercel (recommended)
- Railway
- Heroku
- Custom server

Update API URL after deployment.

## 📝 Next Steps

1. ✅ Set up database and test backend endpoints
2. ✅ Create login/signup screens
3. ✅ Connect browse screen to products API
4. ✅ Connect cart operations to API
5. ✅ Connect orders to API
6. ✅ Test payment processing
7. ✅ Deploy to production

## 📚 Resources

- [API Service Code](../services/api-service.ts)
- [App Context Code](../context/app-context.tsx)
- [Backend API Docs](../../masstock-backend/README.md)
- [Axios Documentation](https://axios-http.com/)
- [Expo AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/)
