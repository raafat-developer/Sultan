import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FastManLogo } from '../../src/components/FastManLogo';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { GpsRouteSimulator } from '../../src/components/GpsRouteSimulator';
import { CustomerStatusPushToast } from '../../src/components/CustomerStatusPushToast';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useSettingsStore } from '../../src/store/settingsStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import {
  Search,
  Bike,
  Phone,
  KeyRound,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Printer,
  FileText,
  Share2,
  ArrowRight,
  ShieldCheck,
  Package,
  Bell,
} from 'lucide-react-native';

export default function CustomerTrackScreen() {
  const router = useRouter();
  const { t, isRTL, colors, language } = useSettingsStore();

  const [orderCode, setOrderCode] = useState('FM-2026-000123');
  const [pushToastVisible, setPushToastVisible] = useState(false);
  const [toastStatus, setToastStatus] = useState('OUT_FOR_DELIVERY');
  const [activeOrder, setActiveOrder] = useState<any>({
    orderNumber: 'FM-2026-000123',
    pickupName: 'Zaatar W Zeit Bakery',
    deliveryAddress: '14 Abbas El Akkad St, Nasr City, Cairo',
    packageDescription: 'Fresh Bakery & Pastry Box',
    status: 'OUT_FOR_DELIVERY',
    codAmount: 500,
    deliveryFee: 45,
    customerOtp: '4827',
    etaMinutes: 12,
    courier: {
      name: 'Ahmed Mohamed',
      phone: '+201000000011',
      plateNumber: 'ق ل م 123',
      rating: 4.9,
      deliveriesCount: 642,
    },
  });

  const [rating, setRating] = useState(5);
  const [rated, setRated] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const demoOrders: Record<string, any> = {
    'FM-2026-000123': {
      orderNumber: 'FM-2026-000123',
      pickupName: 'Zaatar W Zeit Bakery',
      deliveryAddress: '14 Abbas El Akkad St, Nasr City, Cairo',
      packageDescription: 'Fresh Bakery & Pastry Box',
      status: 'OUT_FOR_DELIVERY',
      codAmount: 500,
      deliveryFee: 45,
      customerOtp: '4827',
      etaMinutes: 12,
      courier: {
        name: 'Ahmed Mohamed',
        phone: '+201000000011',
        plateNumber: 'ق ل م 123',
        rating: 4.9,
        deliveriesCount: 642,
      },
    },
    'FM-2026-000124': {
      orderNumber: 'FM-2026-000124',
      pickupName: 'Koshary Abou Tarek',
      deliveryAddress: '22 Tahrir St, Dokki, Giza',
      packageDescription: '4 Special Koshary Meals',
      status: 'DELIVERED',
      codAmount: 220,
      deliveryFee: 35,
      customerOtp: '9182',
      etaMinutes: 0,
      courier: {
        name: 'Mohamed Taha',
        phone: '+201000000012',
        plateNumber: 'س ع د 456',
        rating: 4.8,
        deliveriesCount: 890,
      },
    },
    'FM-2026-000125': {
      orderNumber: 'FM-2026-000125',
      pickupName: 'B.TECH Electronics',
      deliveryAddress: 'Degla Palms, 6th of October City',
      packageDescription: 'Wireless Earbuds & Power Bank',
      status: 'GOING_TO_PICKUP',
      codAmount: 1850,
      deliveryFee: 65,
      customerOtp: '3351',
      etaMinutes: 24,
      courier: {
        name: 'Mostafa Ali',
        phone: '+201000000013',
        plateNumber: 'ن ص ر 789',
        rating: 4.95,
        deliveriesCount: 1120,
      },
    },
  };

  const handleSearch = () => {
    const trimmed = orderCode.trim().toUpperCase();
    if (demoOrders[trimmed]) {
      setActiveOrder(demoOrders[trimmed]);
    } else {
      Alert.alert('بحث عن شحنة', `تم العثور على شحنة تجريبية لرقم ${trimmed}`);
      setActiveOrder({
        ...demoOrders['FM-2026-000123'],
        orderNumber: trimmed,
      });
    }
  };

  const selectDemo = (code: string) => {
    setOrderCode(code);
    setActiveOrder(demoOrders[code]);
  };

  const callCourier = () => {
    if (activeOrder?.courier?.phone) {
      Linking.openURL(`tel:${activeOrder.courier.phone}`);
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    } else {
      Alert.alert('📄 طباعة البيان', 'تم تجهيز بيان التوصيل والفاتورة الرقمية بنجاح.');
    }
  };

  const simulateNextPushStatus = () => {
    const statuses = ['ASSIGNED', 'GOING_TO_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER', 'DELIVERED'];
    const currentIndex = statuses.indexOf(activeOrder?.status || 'OUT_FOR_DELIVERY');
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setActiveOrder((prev: any) => ({ ...prev, status: nextStatus }));
    setToastStatus(nextStatus);
    setPushToastVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Live Customer Status Push Notification Toast */}
      <CustomerStatusPushToast
        visible={pushToastVisible}
        status={toastStatus}
        orderNumber={activeOrder?.orderNumber || 'FM-2026-000123'}
        onDismiss={() => setPushToastVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={[styles.loginBackBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <Text style={[styles.loginBackText, { color: colors.primary }]}>← تسجيل الدخول</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <LanguageToggle />
          </View>
        </View>

        {/* Brand Header */}
        <View style={styles.brandSection}>
          <FastManLogo size="md" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.trackOrder}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            تتبع موقع دراجة التوصيل الحية لحظة بلحظة
          </Text>
        </View>

        {/* Live Push Notification Simulation Banner */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={simulateNextPushStatus}
          style={[
            styles.pushSimulateBtn,
            { backgroundColor: colors.surface, borderColor: colors.primary }
          ]}
        >
          <View style={styles.pushSimulateLeft}>
            <Bell size={18} color={colors.primary} />
            <Text style={[styles.pushSimulateText, { color: colors.text }]}>
              {language === 'ar' ? '🔔 تجربة إشعار تحديث الحالة المباشر (Push)' : '🔔 Simulate Status Live Push Notification'}
            </Text>
          </View>
          <Text style={[styles.pushSimulateBadge, { backgroundColor: colors.surfaceElevated, color: colors.primary }]}>
            {activeOrder?.status}
          </Text>
        </TouchableOpacity>

        {/* Search Box */}
        <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.searchRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t.enterTrackingCode}
              placeholderTextColor={colors.textMuted}
              value={orderCode}
              onChangeText={setOrderCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
              <Text style={styles.searchBtnText}>{t.trackNow}</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Chips */}
          <View style={styles.demoSection}>
            <Text style={[styles.demoLabel, { color: colors.textMuted }]}>{t.demoCodes}</Text>
            <View style={styles.demoRow}>
              {['FM-2026-000123', 'FM-2026-000124', 'FM-2026-000125'].map((code) => (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.demoChip,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    orderCode === code && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => selectDemo(code)}
                >
                  <Text
                    style={[
                      styles.demoChipText,
                      { color: colors.textSecondary },
                      orderCode === code && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Live GPS Route Simulator */}
        {activeOrder && (
          <>
            {/* Live Road Traffic & Delivery SLA Banner */}
            <View style={[styles.trafficBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.trafficLeft}>
                <View style={[styles.trafficDot, { backgroundColor: colors.success }]} />
                <View>
                  <Text style={[styles.trafficTitle, { color: colors.text }]}>
                    {language === 'ar' ? 'حالة الطريق: سرعة طبيعية وسلسة 🟢' : 'Road Traffic: Normal & Fast Route 🟢'}
                  </Text>
                  <Text style={[styles.trafficSub, { color: colors.textMuted }]}>
                    {language === 'ar'
                      ? 'تم اختيار أفضل مسار تجنباً للازدحام بواسطة نظام الملاحة الذكي'
                      : 'AI Route optimized to avoid traffic congestion'}
                  </Text>
                </View>
              </View>
              <View style={[styles.trafficEtaBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.trafficEtaText, { color: colors.success }]}>
                  {activeOrder.etaMinutes ? `${activeOrder.etaMinutes} دقيقة` : 'الوصول قريب'}
                </Text>
              </View>
            </View>

            <GpsRouteSimulator
              pickupName={activeOrder.pickupName}
              deliveryAddress={activeOrder.deliveryAddress}
              status={activeOrder.status}
              orderNumber={activeOrder.orderNumber}
            />

            {/* Customer OTP Box */}
            <View style={[styles.otpCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.goldAccent }]}>
              <View style={styles.otpIconCol}>
                <KeyRound size={28} color={colors.goldAccent} />
              </View>
              <View style={styles.otpDetails}>
                <Text style={[styles.otpLabel, { color: colors.goldAccent }]}>{t.showOtpToCourier}</Text>
                <Text style={[styles.otpCode, { color: colors.text }]}>{activeOrder.customerOtp}</Text>
                <Text style={[styles.otpNotice, { color: colors.textMuted }]}>رمز سري مخصص لضمان استلامك الشخصي للشحنة</Text>
              </View>
            </View>

            {/* Courier Profile Card */}
            <View style={[styles.courierCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.courierHeader}>
                <View style={[styles.courierAvatar, { backgroundColor: colors.primary }]}>
                  <Bike size={22} color="#FFFFFF" />
                </View>
                <View style={styles.courierMeta}>
                  <Text style={[styles.courierRole, { color: colors.textMuted }]}>{t.courierAssigned}</Text>
                  <Text style={[styles.courierName, { color: colors.text }]}>{activeOrder.courier.name}</Text>
                  <Text style={[styles.courierPlate, { color: colors.primary }]}>🏍️ {activeOrder.courier.plateNumber}</Text>
                </View>
                <TouchableOpacity style={styles.callCourierBtn} onPress={callCourier} activeOpacity={0.8}>
                  <Phone size={18} color="#FFFFFF" />
                  <Text style={styles.callCourierText}>{t.callCourier}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Commercial Tax Invoice & Verified Receipt Card */}
            <View style={[styles.receiptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.receiptHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color={colors.primary} />
                  <Text style={[styles.receiptTitle, { color: colors.text }]}>
                    {language === 'ar' ? 'فاتورة الاستلام الضريبية الرسمية' : 'Official Commercial Tax Invoice'}
                  </Text>
                </View>
                <View style={[styles.verifiedPill, { backgroundColor: 'rgba(5, 150, 105, 0.12)' }]}>
                  <ShieldCheck size={12} color={colors.success} />
                  <Text style={[styles.verifiedPillText, { color: colors.success }]}>معتمدة إلكترونياً</Text>
                </View>
              </View>

              <Text style={[styles.receiptTaxId, { color: colors.textMuted }]}>
                سجل تجاري وضريبي رقم: 491-882-109 • فاتورة: INV-2026-99214
              </Text>

              <View style={styles.receiptRows}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptRowLabel, { color: colors.textMuted }]}>محتويات الشحنة:</Text>
                  <Text style={[styles.receiptRowVal, { color: colors.text }]}>{activeOrder.packageDescription}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptRowLabel, { color: colors.textMuted }]}>قيمة المشتريات (Subtotal):</Text>
                  <Text style={[styles.receiptRowVal, { color: colors.text }]}>450.00 ج</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptRowLabel, { color: colors.textMuted }]}>أجرة التوصيل السريع:</Text>
                  <Text style={[styles.receiptRowVal, { color: colors.text }]}>{activeOrder.deliveryFee}.00 ج</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptRowLabel, { color: colors.textMuted }]}>ضريبة القيمة المضافة (14% VAT):</Text>
                  <Text style={[styles.receiptRowVal, { color: colors.text }]}>5.00 ج</Text>
                </View>
                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
                <View style={styles.receiptTotalRow}>
                  <Text style={[styles.receiptTotalLabel, { color: colors.text }]}>المبلغ الإجمالي للدفع عند الاستلام (COD):</Text>
                  <Text style={[styles.receiptTotalVal, { color: colors.goldAccent }]}>{activeOrder.codAmount}.00 ج</Text>
                </View>
              </View>
            </View>

            {/* Rate & Tip Courier */}
            <View style={[styles.feedbackCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.feedbackTitle, { color: colors.text }]}>{t.rateDelivery}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => { setRating(star); setRated(true); }}>
                    <Star
                      size={28}
                      color={star <= rating ? '#FBBF24' : colors.border}
                      fill={star <= rating ? '#FBBF24' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rated && <Text style={styles.ratedThankYou}>شكراً لتقييمك! نسعد بخدمتك دائماً ⭐️</Text>}

              <Text style={[styles.feedbackTitle, { marginTop: 14, color: colors.text }]}>{t.tipCourier}</Text>
              <View style={styles.tipsRow}>
                {[10, 20, 50].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.tipChip,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      selectedTip === amt && { borderColor: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.15)' },
                    ]}
                    onPress={() => setSelectedTip(amt)}
                  >
                    <Text style={[
                      styles.tipChipText,
                      { color: colors.textSecondary },
                      selectedTip === amt && { color: '#FBBF24', fontWeight: '800' },
                    ]}>
                      +{amt} جنيه
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Bar (Print / Share) */}
            <View style={styles.actionsBar}>
              <TouchableOpacity
                style={[styles.printBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={handlePrint}
                activeOpacity={0.85}
              >
                <Printer size={16} color={colors.text} />
                <Text style={[styles.printBtnText, { color: colors.text }]}>
                  {language === 'ar' ? 'طباعة الفاتورة الضريبية الرسمية' : t.printInvoice}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090C14',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  loginBackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: '#161C2C',
  },
  loginBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E5FF',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pushSimulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  pushSimulateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pushSimulateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pushSimulateBadge: {
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  trafficBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  trafficLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trafficDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  trafficSub: {
    fontSize: 10,
    marginTop: 1,
  },
  trafficEtaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  trafficEtaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  receiptCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  receiptTaxId: {
    fontSize: 10,
    marginBottom: 8,
  },
  receiptRows: {
    gap: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptRowLabel: {
    fontSize: 11,
  },
  receiptRowVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    marginVertical: 4,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  receiptTotalVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  searchCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0D16',
    borderWidth: 1,
    borderColor: '#1E2638',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  searchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  demoSection: {
    marginTop: SPACING.sm,
  },
  demoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    backgroundColor: '#1E2638',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  demoChipActive: {
    backgroundColor: '#00E5FF',
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  demoChipTextActive: {
    color: '#0B0E14',
    fontWeight: '700',
  },
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18150D',
    borderWidth: 1.5,
    borderColor: '#FBBF24',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 14,
  },
  otpIconCol: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpDetails: {
    flex: 1,
  },
  otpLabel: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
  },
  otpCode: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginVertical: 2,
  },
  otpNotice: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  courierCard: {
    backgroundColor: '#121724',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1E2638',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  courierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierMeta: {
    flex: 1,
  },
  courierRole: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  courierName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courierPlate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00E5FF',
    marginTop: 2,
  },
  callCourierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00E676',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  callCourierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A1E11',
  },
  orderSummaryCard: {
    backgroundColor: '#121724',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1E2638',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryPackage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2638',
    marginVertical: SPACING.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  codLabel: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '800',
  },
  feedbackCard: {
    backgroundColor: '#121724',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#1E2638',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  ratedThankYou: {
    fontSize: 12,
    color: '#00E676',
    fontWeight: '700',
    marginTop: 6,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  tipChip: {
    backgroundColor: '#1E2638',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tipChipActive: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  tipChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  tipChipTextActive: {
    color: '#FBBF24',
  },
  actionsBar: {
    marginTop: SPACING.xs,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E2638',
    borderWidth: 1,
    borderColor: '#2D3748',
    height: 48,
    borderRadius: RADIUS.md,
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
