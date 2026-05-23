# Quick Start Guide - Using the New Features

## 🚀 Getting Started in 5 Minutes

### 1. Import the Hooks You Need

```typescript
import {
  useCart,
  useOrders,
  useStore,
  useProducts,
} from "@/hooks/use-firestore";
import { useApp } from "@/context/app-context";
```

---

## 📦 Cart Operations

### Add Item to Cart

```typescript
import { useCart } from '@/hooks/use-firestore';

export default function ProductScreen() {
  const { user } = useApp();
  const { addToCart, getTotal } = useCart(user?.id);

  const handleAddToCart = async () => {
    await addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.wholesalePrice,
      quantity: 1,
      image: product.image,
      minOrder: product.minOrder,
      stock: product.stock,
    });
  };

  return (
    <TouchableOpacity onPress={handleAddToCart}>
      <Text>Add to Cart</Text>
    </TouchableOpacity>
  );
}
```

### Display Cart Items

```typescript
const { cartItems, updateItem, removeItem, getTotal } = useCart(user?.id);

return (
  <FlatList
    data={cartItems}
    renderItem={({ item }) => (
      <View>
        <Text>{item.name}</Text>
        <Text>₱{item.price} x {item.quantity}</Text>
        <Button
          title="Remove"
          onPress={() => removeItem(item.productId)}
        />
      </View>
    )}
  />
);
```

---

## 🛒 Create an Order

```typescript
import { useCart, useOrders } from '@/hooks/use-firestore';

export default function CheckoutScreen() {
  const { user } = useApp();
  const { cartItems, clearCart, getTotal } = useCart(user?.id);
  const { createOrder } = useOrders(user?.id);

  const handlePlaceOrder = async () => {
    const total = getTotal() + 50; // 50 = shipping

    // Create order in Firebase
    const orderId = await createOrder(
      cartItems,
      total,
      'elista', // payment method
      'Manila, Metro Manila' // shipping address
    );

    if (orderId) {
      // Clear cart after successful order
      await clearCart();
      Alert.alert('Success', 'Order placed!');
    }
  };

  return (
    <Button title={`Checkout - ₱${(getTotal() + 50)}`} onPress={handlePlaceOrder} />
  );
}
```

---

## 📋 View Orders

```typescript
import { useOrders } from '@/hooks/use-firestore';

export default function OrdersScreen() {
  const { user } = useApp();
  const { orders, loading, getOrdersByStatus } = useOrders(user?.id);

  // Get orders by status
  const activeOrders = getOrdersByStatus('packing');
  const deliveredOrders = getOrdersByStatus('delivered');

  return (
    <FlatList
      data={activeOrders}
      renderItem={({ item }) => (
        <View>
          <Text>Order #{item.id.substring(0, 8)}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Total: ₱{item.total}</Text>
        </View>
      )}
    />
  );
}
```

---

## 🏪 Store Management

### Create Store

```typescript
import { useStore } from '@/hooks/use-firestore';

export default function CreateStoreScreen() {
  const { user } = useApp();
  const { createStore } = useStore(user?.id);

  const handleCreateStore = async () => {
    const success = await createStore({
      name: 'My Store',
      description: 'Wholesale marketplace',
      level: 'bronze',
      rating: 5,
      credit: 0,
      totalSales: 0,
      totalOrders: 0,
      followers: 0,
      verified: false,
    });

    if (success) {
      Alert.alert('Success', 'Store created!');
    }
  };

  return <Button title="Create Store" onPress={handleCreateStore} />;
}
```

### Manage Prices

```typescript
const { updateProductPrice } = useStore(user?.id);

const handleUpdatePrice = async (productId: string) => {
  await updateProductPrice(
    productId,
    250, // new retail price
    200, // new wholesale price
  );
  Alert.alert("Updated", "Price updated successfully!");
};
```

### Update Stock

```typescript
const { updateProductStock } = useStore(user?.id);

const handleUpdateStock = async (productId: string) => {
  await updateProductStock(productId, 150); // new stock level
  Alert.alert("Updated", "Stock updated successfully!");
};
```

---

## 🔍 Browse Products

```typescript
import { useProducts } from '@/hooks/use-firestore';

export default function BrowseScreen() {
  const { products, loading, getProductsByCategory, searchProducts } = useProducts();

  // Load products by category
  useEffect(() => {
    getProductsByCategory('Snacks & Soda', 20);
  }, []);

  // Search products
  const handleSearch = (term: string) => {
    searchProducts(term, 20);
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>₱{item.wholesalePrice}</Text>
          {item.stock === 0 && <Text>Out of Stock</Text>}
        </View>
      )}
    />
  );
}
```

---

## 💳 Handle Out-of-Stock Products

```typescript
function ProductCard({ product }) {
  const isInStock = product.stock > 0;

  return (
    <View style={{ opacity: isInStock ? 1 : 0.5 }}>
      <Text>{product.name}</Text>
      <Text>₱{product.wholesalePrice}</Text>

      <TouchableOpacity disabled={!isInStock}>
        <Text>{isInStock ? 'Add to Cart' : 'Out of Stock'}</Text>
      </TouchableOpacity>

      {!isInStock && <Text>Stock: {product.stock}</Text>}
    </View>
  );
}
```

---

## 💰 Price Display with Discounts

```typescript
function PriceDisplay({ product }) {
  const discount = Math.round(
    ((product.retailPrice - product.wholesalePrice) / product.retailPrice) * 100
  );

  return (
    <View>
      <Text style={styles.retailPrice}>
        ₱{product.retailPrice} <Text style={styles.strikethrough}>retail</Text>
      </Text>
      <Text style={styles.wholesalePrice}>
        ₱{product.wholesalePrice} wholesale
      </Text>
      {discount > 0 && (
        <Text style={styles.discount}>Save {discount}%</Text>
      )}
    </View>
  );
}
```

---

## ⚠️ Error Handling

```typescript
import { useCart } from '@/hooks/use-firestore';

export default function SafeCartScreen() {
  const { cartItems, error, addToCart } = useCart(user?.id);

  const handleAddToCart = async () => {
    try {
      await addToCart(item);
      if (error) {
        Alert.alert('Error', error);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Rest of component */}
    </View>
  );
}
```

---

## 🔄 Refresh Data

```typescript
import { useOrders } from '@/hooks/use-firestore';

export default function OrdersScreen() {
  const { orders, loadOrders } = useOrders(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={orders}
      onEndReached={loadOrders}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
```

---

## 📊 Track Order Status

```typescript
function OrderTimeline({ order }) {
  const stages = [
    { label: 'Pending', completed: ['pending', 'packing', 'in-transit', 'delivered'].includes(order.status) },
    { label: 'Packing', completed: ['packing', 'in-transit', 'delivered'].includes(order.status) },
    { label: 'In Transit', completed: ['in-transit', 'delivered'].includes(order.status) },
    { label: 'Delivered', completed: order.status === 'delivered' },
  ];

  return (
    <View>
      {stages.map((stage, index) => (
        <View key={index}>
          <View style={{ backgroundColor: stage.completed ? '#4CAF50' : '#E0E0E0' }} />
          <Text>{stage.label}</Text>
        </View>
      ))}
    </View>
  );
}
```

---

## 🎯 Common Patterns

### Pattern 1: Load and Display Data

```typescript
const { data, loading, loadData } = useHook(userId);

useEffect(() => {
  loadData();
}, [loadData]);

if (loading) return <ActivityIndicator />;
return <FlatList data={data} renderItem={renderItem} />;
```

### Pattern 2: Handle Updates

```typescript
const { updateItem, error } = useHook(userId);

const handleUpdate = async () => {
  await updateItem(id, newValue);
  if (error) {
    Alert.alert("Error", error);
  } else {
    Alert.alert("Success", "Updated!");
  }
};
```

### Pattern 3: Filter and Sort

```typescript
const { items, getItemsByStatus } = useHook(userId);

const filteredItems = getItemsByStatus("active");
const sorted = filteredItems.sort((a, b) => b.date - a.date);
```

---

## 🧪 Testing Tips

1. **Test offline**: Disconnect internet and see error handling
2. **Test with empty data**: What happens with no cart/orders?
3. **Test transitions**: Go from cart → order → payment → confirmation
4. **Test stock limits**: Try ordering more than available stock
5. **Test price changes**: Update prices and verify they show correctly

---

## 📞 Support

For issues:

1. Check console for Firebase errors
2. Verify Firestore rules allow the operation
3. Confirm user is authenticated
4. Check network connection
5. Review error message in the hook

---

**Happy Coding!** 🎉

For detailed information, see `IMPLEMENTATION_GUIDE.md`
