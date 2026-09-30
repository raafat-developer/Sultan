import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Bell, CheckCircle2, Bike, PackageCheck, X, Sparkles } from 'lucide-react-native';

interface CustomerStatusPushToastProps {
  visible: boolean;
  status: string;
  orderNumber: string;
  onDismiss: () => void;
}

export function CustomerStatusPushToast({
  visible,
  status,
  orderNumber,
  onDismiss,
}: CustomerStatusPushToastProps) {
  const { colors, language } = useSettingsStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  const statusConfig: Record<string, { titleAr: string; titleEn: string; descAr: string; descEn: string; color: string; icon: any }> = {
    ASSIGNED: {
      titleAr: 'تم تعيين مندوب التوصيل',
      titleEn: 'Courier Assigned',
      descAr: 'المندوب أحمد محمد في طريقه لاستلام شحنتك',
      descEn: 'Courier Ahmed Mohamed is heading to collect your package',
      color: '#00E5FF',
      icon: Bike,
    },
    GOING_TO_PICKUP: {
      titleAr: 'المندوب متوجه للمتجر',
      titleEn: 'Heading to Store',
      descAr: 'الدراجة النارية تتحرك الآن لاستلام طلبك',
      descEn: 'Motorcycle is now en route to store',
      color: '#3B82F6',
      icon: Bike,
    },
    PICKED_UP: {
      titleAr: 'تم استلام الشحنة بنجاح',
      titleEn: 'Package Collected',
      descAr: 'تم فحص الشحنة وهي في أمان تام مع المندوب',
      descEn: 'Package verified and safely in courier custody',
      color: '#FBBF24',
      icon: PackageCheck,
    },
    OUT_FOR_DELIVERY: {
      titleAr: 'الشحنة في الطريق إليك الآن!',
      titleEn: 'Out for Delivery!',
      descAr: 'المندوب يقترب من موقعك (الوصول المتوقع خلال دقائق)',
      descEn: 'Courier is approaching your delivery address',
      color: '#E50914',
      icon: Bike,
    },
    ARRIVED_AT_CUSTOMER: {
      titleAr: 'المندوب وصل لموقعك!',
      titleEn: 'Courier Has Arrived!',
      descAr: 'المندوب بالأسفل الآن، يرجى تجهيز رمز التحقق OTP',
      descEn: 'Courier is downstairs, please have your OTP ready',
      color: '#00E676',
      icon: CheckCircle2,
    },
    DELIVERED: {
      titleAr: 'تم تسليم الطلب بنجاح 🎉',
      titleEn: 'Order Delivered Successfully 🎉',
      descAr: 'تم التحقق واستلام الشحنة بنجاح، شكراً لاختيارك فاست مان',
      descEn: 'Package handed over and verified. Thank you!',
      color: '#00E676',
      icon: Sparkles,
    },
  };

  const currentConfig = statusConfig[status] || statusConfig.OUT_FOR_DELIVERY;
  const IconComp = currentConfig.icon;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
        bounciness: 12,
      }).start();

      const timer = setTimeout(() => {
        handleClose();
      }, 5500);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, {
        toValue: -140,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -140,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toastCard, { borderColor: currentConfig.color }]}>
        <View style={[styles.iconCircle, { backgroundColor: `${currentConfig.color}25` }]}>
          <IconComp size={22} color={currentConfig.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text style={styles.appTag}>FAST MAN PUSH • {orderNumber}</Text>
          </View>
          <Text style={styles.toastTitle}>
            {language === 'ar' ? currentConfig.titleAr : currentConfig.titleEn}
          </Text>
          <Text style={styles.toastDesc}>
            {language === 'ar' ? currentConfig.descAr : currentConfig.descEn}
          </Text>
        </View>

        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <X size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F131D',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.glow,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toastDesc: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E2638',
    borderRadius: RADIUS.full,
  },
});
