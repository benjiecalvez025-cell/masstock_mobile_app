import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCart } from "@/hooks/use-firestore";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAppContext();
  const { getItemCount } = useCart(user?.id);
  const cartBadge = getItemCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          paddingBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.lightGray,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home-filled" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="storefront" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={24} color={color} />
          ),
          tabBarBadge: cartBadge > 0 ? cartBadge.toString() : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            color: "#fff",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
