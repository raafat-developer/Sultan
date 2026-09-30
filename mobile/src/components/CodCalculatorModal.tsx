import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { Banknote, Calculator, Check, X, AlertCircle } from 'lucide-react-native';

interface CodCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  requiredAmount: number;
  onConfirmAmount: (amount: number, reason?: string) => void;
}

export function CodCalculatorModal({
  visible,
  onClose,
  requiredAmount,
  onConfirmAmount,
}: CodCalculatorModalProps) {
  const { t, isRTL } = useSettingsStore();
  const [tendered, setTendered] = useState<string>(String(requiredAmount));
  const [reason, setReason] = useState<string>('');

  const tenderedNum = parseFloat(tendered) || 0;
  const changeDue = Math.max(0, tenderedNum - requiredAmount);
  const isShortage = tenderedNum < requiredAmount && tenderedNum > 0;

  const quickAmounts = [
    requiredAmount,
    requiredAmount + 50,
    requiredAmount + 100,
    1000,
  ];

  const handleConfirm = () => {
    onConfirmAmount(tenderedNum, isShortage ? reason : undefined);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Calculator size={20} color="#00E676" />
              <Text style={styles.title}>{t.codAssistant}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Amount Due Badge */}
          <View style={styles.amountDueCard}>
            <Text style={styles.amountDueLabel}>المبلغ المطلوب تحصيله (COD)</Text>
            <Text style={styles.amountDueValue}>
              {requiredAmount} <Text style={styles.currency}>جنيه</Text>
            </Text>
          </View>

          {/* Customer Paid Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>المبلغ المستلم من العميل نقداً:</Text>
            <View style={styles.inputWrapper}>
              <Banknote size={18} color="#9CA3AF" />
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={tendered}
                onChangeText={setTendered}
                placeholder="أدخل المبلغ المستلم"
                placeholderTextColor="#6B7280"
              />
              <Text style={styles.inputCurrency}>جنيه</Text>
            </View>
          </View>

          {/* Quick Cash Suggestions */}
          <View style={styles.quickRow}>
            {quickAmounts.map((amt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quickChip,
                  tenderedNum === amt && styles.quickChipActive,
                ]}
                onPress={() => setTendered(String(amt))}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    tenderedNum === amt && styles.quickChipTextActive,
                  ]}
                >
                  {amt === requiredAmount ? 'بالضبط' : `${amt} ج`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Live Change Due Display */}
          <View
            style={[
              styles.changeDisplay,
              isShortage ? styles.shortageBox : styles.changeBox,
            ]}
          >
            {isShortage ? (
              <View style={styles.shortageRow}>
                <AlertCircle size={18} color="#EF4444" />
                <Text style={styles.shortageText}>
                  عجز في المبلغ بمقدار: {requiredAmount - tenderedNum} جنيه
                </Text>
              </View>
            ) : (
              <View style={styles.changeSuccessRow}>
                <Text style={styles.changeLabel}>{t.changeDue}:</Text>
                <Text style={styles.changeValue}>
                  {changeDue} <Text style={styles.currencySmall}>جنيه</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Shortage explanation input if underpaid */}
          {isShortage && (
            <TextInput
              style={styles.reasonInput}
              placeholder="سبب النقص في التحصيل (مطلوب)"
              placeholderTextColor="#6B7280"
              value={reason}
              onChangeText={setReason}
            />
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>{t.confirmCollected}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121622',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#1E2638',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E2638',
    borderRadius: RADIUS.full,
  },
  amountDueCard: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderColor: 'rgba(229, 9, 20, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  amountDueLabel: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
  },
  amountDueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F87171',
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090C14',
    borderWidth: 1,
    borderColor: '#1E2638',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inputCurrency: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#1E2638',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  quickChipActive: {
    backgroundColor: '#E50914',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
  },
  changeDisplay: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  changeBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: '#00E676',
    borderWidth: 1,
  },
  shortageBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  changeSuccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00E676',
  },
  changeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00E676',
  },
  currencySmall: {
    fontSize: 12,
    fontWeight: '600',
  },
  shortageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shortageText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
  },
  reasonInput: {
    backgroundColor: '#090C14',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: '#00E676',
    height: 50,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: '#0A1E11',
    fontSize: 15,
    fontWeight: '800',
  },
});
