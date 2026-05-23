import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function WelcomeScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: tintColor }]}>Masstock</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>B2B Marketplace</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            title="Wholesale Pricing"
            description="Access bulk pricing and discounts for business purchases"
            icon="🛍️"
          />
          <FeatureItem
            title="E-Wallet"
            description="Easy payment and fund management with E-Lista Credit"
            icon="💳"
          />
          <FeatureItem
            title="Order Tracking"
            description="Real-time tracking of your orders from order to delivery"
            icon="📍"
          />
          <FeatureItem
            title="Store Management"
            description="For sellers: Manage your store, inventory, and sales analytics"
            icon="🏪"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: tintColor }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.secondaryButtonText, { color: tintColor }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest Access */}
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Text style={[styles.guestText, { color: textColor }]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'tabIconDefault');

  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: secondaryText }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  features: {
    gap: 20,
    marginVertical: 30,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  guestText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
  },
});
