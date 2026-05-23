import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ClientInfo } from "@/types/client";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

interface ClientInfoModalProps {
  visible: boolean;
  onSubmit: (clientInfo: ClientInfo) => void;
  colorScheme: "light" | "dark";
}

const placeholder = "https://via.placeholder.com/200?text=Store+Image";

export default function ClientInfoModal({
  visible,
  onSubmit,
  colorScheme,
}: ClientInfoModalProps) {
  const colors = Colors[colorScheme];

  const [form, setForm] = useState<ClientInfo>({
    completeName: "",
    storeName: "",
    address: "",
    contactNo: "",
    pinLocation: "",
    storeImage: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setForm((prev) => ({ ...prev, storeImage: result.assets[0].uri }));
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setForm((prev) => ({ ...prev, storeImage: result.assets[0].uri }));
    }
  };

  const handleSubmit = () => {
    if (
      !form.completeName.trim() ||
      !form.storeName.trim() ||
      !form.address.trim() ||
      !form.contactNo.trim() ||
      !form.pinLocation.trim()
    ) {
      Alert.alert("Validation", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(form);
      setIsSubmitting(false);
      setForm({
        completeName: "",
        storeName: "",
        address: "",
        contactNo: "",
        pinLocation: "",
        storeImage: "",
      });
    }, 500);
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.overlay}
    >
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Client Information</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please provide details for this order
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          {/* Store Image */}
          <TouchableOpacity
            style={[styles.imageContainer, { backgroundColor: colors.background }]}
            onPress={handlePickImage}
          >
            {form.storeImage ? (
              <Image source={{ uri: form.storeImage }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="image" size={40} color={colors.textSecondary} />
                <Text style={[styles.imageText, { color: colors.textSecondary }]}>
                  Tap to add store image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={[styles.imageBtn, { backgroundColor: colors.primary }]}
              onPress={handlePickImage}
            >
              <MaterialIcons name="photo-library" size={16} color="#fff" />
              <Text style={styles.imageBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageBtn, { backgroundColor: colors.accent ?? colors.primary }]}
              onPress={handleTakePhoto}
            >
              <MaterialIcons name="camera-alt" size={16} color="#fff" />
              <Text style={styles.imageBtnText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {[
            { label: "Complete Name *", field: "completeName", keyboard: "default" },
            { label: "Store Name *", field: "storeName", keyboard: "default" },
            { label: "Address *", field: "address", keyboard: "default", multiline: true },
            { label: "Contact No. *", field: "contactNo", keyboard: "phone-pad" },
            { label: "Pin Location *", field: "pinLocation", keyboard: "default" },
          ].map(({ label, field, keyboard, multiline }) => (
            <View key={field} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {label}
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border ?? "#e0e0e0",
                  },
                  multiline && { height: 80, textAlignVertical: "top" },
                ]}
                placeholder={label.replace(" *", "")}
                placeholderTextColor={colors.textSecondary}
                keyboardType={keyboard as any}
                multiline={multiline}
                value={form[field as keyof ClientInfo] as string}
                onChangeText={(v) =>
                  setForm((prev) => ({ ...prev, [field]: v }))
                }
              />
            </View>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Continue to Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalContent: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  imageButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  imageBtnText: {
    color: "#fff",
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.sm,
    marginBottom: 4,
    fontWeight: Typography.fontWeights.medium,
  },
  fieldInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizes.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  submitBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
