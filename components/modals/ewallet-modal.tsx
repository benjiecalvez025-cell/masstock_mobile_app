import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface EwalletModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  onCashIn?: (amount: number) => void;
  onCashOut?: (amount: number) => void;
}

export function EwalletModal({
  visible,
  onClose,
  balance,
  onCashIn,
  onCashOut,
}: EwalletModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'cashin' | 'cashout'>('cashin');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (mode === 'cashin' && onCashIn) {
      onCashIn(numAmount);
    } else if (mode === 'cashout' && onCashOut) {
      if (numAmount > balance) {
        return; // Insufficient balance
      }
      onCashOut(numAmount);
    }

    setAmount('');
    onClose();
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              E-Lista Wallet
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Balance Display */}
            <View style={[styles.balanceCard, { backgroundColor: colors.primary + '10' }]}>
              <MaterialIcons name="account-balance-wallet" size={32} color={colors.primary} />
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.text }]}>
                  Current Balance
                </Text>
                <Text style={[styles.balanceAmount, { color: colors.primary }]}>
                  ₱{balance.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'cashin' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setMode('cashin')}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === 'cashin' && { color: '#fff' },
                  ]}
                >
                  Cash In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'cashout' && { backgroundColor: colors.primary },
                ]}
                onPress={() => setMode('cashout')}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === 'cashout' && { color: '#fff' },
                  ]}
                >
                  Cash Out
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountSection}>
              <Text style={[styles.amountLabel, { color: colors.text }]}>
                Amount (₱)
              </Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text, borderColor: colors.primary }]}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[styles.quickButton, { borderColor: colors.primary }]}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text style={[styles.quickText, { color: colors.primary }]}>
                      ₱{quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary },
                (!amount || parseFloat(amount) <= 0 || (mode === 'cashout' && parseFloat(amount) > balance)) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || (mode === 'cashout' && parseFloat(amount) > balance)}
            >
              <Text style={styles.actionText}>
                {mode === 'cashin' ? 'Cash In' : 'Cash Out'}
              </Text>
            </TouchableOpacity>

            {mode === 'cashout' && parseFloat(amount || '0') > balance && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                Insufficient balance
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  content: {
    padding: Spacing.lg,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  balanceInfo: {
    marginLeft: Spacing.md,
  },
  balanceLabel: {
    fontSize: Typography.sizes.sm,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    backgroundColor: '#f0f0f0',
  },
  modeText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  amountSection: {
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.md,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  quickText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  actionButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
