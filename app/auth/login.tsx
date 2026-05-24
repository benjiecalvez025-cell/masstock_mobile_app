import { Spacing, Typography } from "@/constants/theme";
import { useAppContext } from "@/context/app-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  loginWithFirebase,
  parseFirebaseAuthError,
} from "@/services/auth-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const colors = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await loginWithFirebase(email, password);
      const backendUser = response.user;
      const emailAddr = backendUser.email || email;

      setUser({
        id: String(backendUser.id),
        name:
          `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() ||
          "User",
        email: emailAddr,
        phone: backendUser.phone || "",
        ewallet: backendUser.eWallet ?? 0,
      });

      Alert.alert("Success", "Logged in successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      const message = parseFirebaseAuthError(error);
      Alert.alert("Sign In Error", message);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUser({
      id: "demo-seller",
      name: "Demo Seller",
      email: "demo@masstock.com",
      phone: "09171234567",
      ewallet: 5000,
    });
    router.replace("/(tabs)");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: colors }]}>Welcome Back</Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: colors }]}
            placeholder="your@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={[styles.label, { color: textColor }]}>Password</Text>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: colors }]}
            placeholder="••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors, opacity: loading ? 0.6 : 1 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {__DEV__ ? (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLogin}
              disabled={loading}
            >
              <Text style={[styles.demoButtonText, { color: colors }]}>Use Demo Seller</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor }]}>
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[styles.linkText, { color: colors }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.xxl,
    textAlign: "center",
  },
  form: {
    gap: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.md,
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  demoButton: {
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: Spacing.md,
  },
  demoButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  buttonText: {
    color: "#fff",
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSizes.md,
  },
  linkText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
