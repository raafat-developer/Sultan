import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import {
  Bell,
  Package,
  MapPin,
  Banknote,
  Navigation,
  CheckCircle,
  X,
  Clock,
  Bike,
} from 'lucide-react-native';

interface IncomingOrderPushModalProps {
  visible: boolean;
  onClose: () => void;
  order?: {
    id: string;
    orderNumber: string;
    pickupName: string;
    deliveryAddress: string;
    fee: number;
    codAmount: number;
  };
}

export function IncomingOrderPushModal({
  visible,
  onClose,
  order = {
    id: 'ord-demo-123',
    orderNumber: 'FM-2026-000123',
    pickupName: 'Zaatar W Zeit Bakery',
    deliveryAddress: '14 Abbas El Akkad St, Nasr City, Cairo',
    fee: 45,
    codAmount: 500,
  },
}: IncomingOrderPushModalProps) {
  const router = useRouter();
  const { colors, t } = useSettingsStore();

  const [countdown, setCountdown] = useState(30);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Pulsing animation for high-priority incoming alert
  useEffect(() => {
    if (visible) {
      setCountdown(30);
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      return () => {
        pulseLoop.stop();
        clearInterval(timer);
      };
    }
  }, [visible]);

  const handleAccept = () => {
    onClose();
    router.push(`/(courier)/delivery/${order.id}`);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Simulated Lock Screen Push Notification Card */}
        <Animated.View style={[styles.dialogCard, { transform: [{ scale: pulseAnim }] }]}>
          {/* Top Lock Screen Banner Tag */}
          <View style={styles.pushHeader}>
            <View style={styles.pushTagRow}>
              <View style={styles.bellIconBox}>
                <Bell size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.pushAppTitle}>FAST MAN EXPRESS • إشعار عاجل</Text>
                <Text style={styles.pushSubtitle}>طلب توصيل جديد في نطاقك الجغرافي</Text>
              </View>
            </View>

            {/* Countdown Badge */}
            <View style={styles.countdownBadge}>
              <Clock size={12} color="#FBBF24" />
              <Text style={styles.countdownText}>{countdown} ثانية</Text>
            </View>
          </View>

          {/* Order Details Body */}
          <View style={styles.cardBody}>
            <View style={styles.orderNoRow}>
              <Text style={styles.orderNumberText}>{order.orderNumber}</Text>
              <Text style={styles.feeHighlight}>+{order.fee} جنيه (أرباحك)</Text>
            </View>

            {/* Pickup & Destination */}
            <View style={styles.locationsContainer}>
              <View style={styles.locationRow}>
                <View style={[styles.dotMarker, { backgroundColor: '#E50914' }]} />
                <View style={styles.locationTextCol}>
                  <Text style={styles.locationLabel}>نقطة الاستلام (المتجر)</Text>
                  <Text style={styles.locationName}>{order.pickupName}</Text>
                </View>
              </View>

              <View style={styles.locationDivider} />

              <View style={styles.locationRow}>
                <View style={[styles.dotMarker, { backgroundColor: '#00E676' }]} />
                <View style={styles.locationTextCol}>
                  <Text style={styles.locationLabel}>نقطة التسليم (العميل)</Text>
                  <Text style={styles.locationAddress}>{order.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* COD Summary */}
            <View style={styles.codRow}>
              <Text style={styles.codLabel}>المبلغ المطلوب تحصيله (COD):</Text>
              <Text style={styles.codValue}>{order.codAmount} جنيه</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#9CA3AF" />
              <Text style={styles.declineBtnText}>تخطي / رفض</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.85}
            >
              <CheckCircle size={20} color="#0A1E11" />
              <Text style={styles.acceptBtnText}>قبول وبدء التوصيل</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: '#E50914',
    overflow: 'hidden',
    ...SHADOWS.glow,
  },
  pushHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161C2C',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2638',
  },
  pushTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pushAppTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
  },
  pushSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FBBF24',
  },
  cardBody: {
    padding: SPACING.md,
  },
  orderNoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderNumberText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  feeHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  locationsContainer: {
    backgroundColor: '#090C14',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#1E2638',
    marginBottom: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  locationTextCol: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 2,
  },
  locationDivider: {
    height: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: '#2D3748',
    marginLeft: 5,
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  codRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  codLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  codValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FBBF24',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    padding: SPACING.md,
    backgroundColor: '#121723',
    borderTopWidth: 1,
    borderTopColor: '#1E2638',
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#1E2638',
    gap: 6,
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#00E676',
    gap: 8,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A1E11',
  },
});
