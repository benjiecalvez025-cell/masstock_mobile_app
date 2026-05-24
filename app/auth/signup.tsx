import { useAppContext } from "@/context/app-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  signupWithFirebase,
  parseFirebaseAuthError,
} from "@/services/auth-service";
import { resolvedFirebaseConfig } from "@/services/firebase.config";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupSource, setSignupSource] = useState<string>("");
  const [signupDebug, setSignupDebug] = useState<string>("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const placeholderColor = useThemeColor({}, "tabIconDefault");
  const firebaseInfo = resolvedFirebaseConfig;

  const validateForm = () => {
    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await signupWithFirebase(
        email,
        password,
        firstName,
        lastName,
      );

      const backendUser = response.user;
      const emailAddr = backendUser.email || email;

      setUser({
        id: String(backendUser.id),
        name: `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() ||
          `${firstName} ${lastName}`.trim(),
        email: emailAddr,
        phone: backendUser.phone || "",
        ewallet: backendUser.eWallet ?? 0,
      });

      setSignupSource(response.source || "firebase");
      setSignupDebug(JSON.stringify(response, null, 2));
      router.replace("/(tabs)");
    } catch (err: any) {
      const message = parseFirebaseAuthError(err);
      setError(message);
      Alert.alert("Signup Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.backButton, { color: tintColor }]}>
                  ← Back
                </Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: textColor }]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: placeholderColor }]}>
                Join Masstock and start trading
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  First Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder="Enter first name"
                  placeholderTextColor={placeholderColor}
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  Last Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder="Enter last name"
                  placeholderTextColor={placeholderColor}
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: textColor }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor={placeholderColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  Confirm Password
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: placeholderColor },
                  ]}
                  placeholder="Confirm password"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            {/* Terms */}
            <Text style={[styles.termsText, { color: placeholderColor }]}>
              By creating an account, you agree to our{" "}
              <Text style={{ color: tintColor }}>Terms of Service</Text> and{" "}
              <Text style={{ color: tintColor }}>Privacy Policy</Text>
            </Text>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                { backgroundColor: tintColor, opacity: loading ? 0.6 : 1 },
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={[styles.loginLinkText, { color: textColor }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={[styles.loginLinkButton, { color: tintColor }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {__DEV__ ? (
              <View style={[styles.debugContainer, { borderColor: tintColor }] }>
                <Text style={[styles.debugTitle, { color: textColor }] }>
                  Debug Info
                </Text>
                <Text style={[styles.debugText, { color: textColor }] }>
                  Using direct Firebase auth
                </Text>
                <Text style={[styles.debugText, { color: textColor }] }>
                  Firebase projectId: {firebaseInfo.projectId}
                </Text>
                <Text style={[styles.debugText, { color: textColor }] }>
                  Firebase appId: {firebaseInfo.appId}
                </Text>
                <Text style={[styles.debugText, { color: textColor }] }>
                  Firebase configured: {firebaseInfo.apiKey ? "yes" : "no"}
                </Text>
                <Text style={[styles.debugText, { color: textColor, marginTop: 8 }] }>
                  Signup source: {signupSource || "unknown"}
                </Text>
                {signupDebug ? (
                  <Text style={[styles.debugText, { color: textColor, marginTop: 4 }] }>
                    {signupDebug}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  signupButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  debugContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
