import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="welcome" options={{ title: "Welcome" }} />
      <Stack.Screen name="signup" options={{ title: "Create Account" }} />
      <Stack.Screen name="login" options={{ title: "Sign In" }} />
    </Stack>
  );
}
