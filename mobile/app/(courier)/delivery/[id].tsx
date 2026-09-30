import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Badge } from '../../../src/components/Badge';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { api } from '../../../src/services/api';
import { Order, OrderStatus } from '../../../src/types';
import { COLORS, RADIUS, SPACING } from '../../../src/constants/theme';
import {
  ArrowLeft,
  Navigation,
  Phone,
  CheckCircle,
  KeyRound,
  Banknote,
  Camera,
  AlertTriangle,
  MapPin,
  Clock,
} from 'lucide-react-native';

export default function DeliveryExecutionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, isRTL } = useSettingsStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Delivery confirmation fields
  const [otp, setOtp] = useState('');
  const [collectedAmount, setCollectedAmount] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [proofPhotoAttached, setProofPhotoAttached] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      if (res.data?.codAmount !== undefined) {
        setCollectedAmount(String(res.data.codAmount));
      }
      // If dev OTP exists, pre-fill as helper hint
      if (res.data?.deliveryOtp?.plainOtpForDev) {
        // Helpful hint for easy demo
      }
    } catch (err: any) {
      Alert.alert(t.error, err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await api.post(`/orders/${id}/accept`);
      Alert.alert('✅ Order Accepted', 'You have accepted this delivery.');
      await fetchOrder();
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.prompt
      ? Alert.prompt('Decline Order', 'Please specify a reason:', async (reason) => {
          if (!reason) return;
          try {
            await api.post(`/orders/${id}/reject`, { reason });
            router.replace('/(courier)/home');
          } catch (err: any) {
            Alert.alert(t.error, err.message);
          }
        })
      : (async () => {
          try {
            await api.post(`/orders/${id}/reject`, { reason: 'Courier unavailable' });
            router.replace('/(courier)/home');
          } catch (err: any) {
            Alert.alert(t.error, err.message);
          }
        })();
  };

  const advanceOperationalStatus = async (nextStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: nextStatus });
      await fetchOrder();
    } catch (err: any) {
      Alert.alert(t.error, err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (!otp.trim()) {
      Alert.alert(t.error, 'Please enter the 4-digit OTP provided by the customer.');
      return;
    }

    const expected = Number(order?.codAmount || 0);
    const collected = Number(collectedAmount || 0);
    const difference = collected - expected;

    if (difference !== 0 && !discrepancyReason.trim()) {
      Alert.alert(t.error, t.reasonPlaceholder);
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/orders/${id}/verify-delivery`, {
        otp: otp.trim(),
        collectedAmount: collected,
        discrepancyReason: difference !== 0 ? discrepancyReason.trim() : undefined,
        photoUrl: proofPhotoAttached ? 'https://fastman-cdn.com/proofs/sample_delivery.jpg' : undefined,
      });

      Alert.alert('🎉 ' + t.deliverySuccess, `Order ${order?.orderNumber} completed successfully.`, [
        {
          text: t.close,
          onPress: () => router.replace('/(courier)/home'),
        },
      ]);
    } catch (err: any) {
      Alert.alert(t.error, err.message || t.invalidOtp);
    } finally {
      setActionLoading(false);
    }
  };

  const openNavigation = (lat: number, lng: number, address: string) => {
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${encodeURIComponent(address)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = (num: string) => Linking.openURL(`tel:${num}`);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const expectedCod = Number(order.codAmount || 0);
  const enteredAmount = Number(collectedAmount || 0);
  const difference = enteredAmount - expectedCod;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{order.orderNumber}</Text>
          <Badge status={order.status} />
        </View>

        {/* Step Progression Guide */}
        <Card style={styles.stepCard}>
          <Text style={styles.stepTitle}>DELIVERY WORKFLOW PROGRESS</Text>
          <View style={styles.statusTimeline}>
            <Text style={styles.currentStatusText}>
              Current Stage:{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '900' }}>
                {order.status}
              </Text>
            </Text>
          </View>
        </Card>

        {/* Flow 1: ASSIGNED (Needs Accept / Reject) */}
        {order.status === 'ASSIGNED' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>NEW ASSIGNMENT RECEIVED</Text>
            <Text style={styles.stageSub}>
              Please accept or decline this delivery assignment immediately.
            </Text>
            <View style={styles.acceptRow}>
              <Button
                title={t.acceptOrder}
                onPress={handleAccept}
                loading={actionLoading}
                style={{ flex: 2 }}
              />
              <Button
                title={t.rejectOrder}
                onPress={handleReject}
                variant="outline"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        {/* Flow 2: ACCEPTED -> GOING TO PICKUP */}
        {order.status === 'COURIER_ACCEPTED' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>HEAD TO PICKUP LOCATION</Text>
            <Text style={styles.stageSub}>Navigate to {order.pickupName} to collect the package.</Text>
            <View style={styles.btnRow}>
              <Button
                title={t.navigate}
                onPress={() =>
                  openNavigation(order.pickupLatitude, order.pickupLongitude, order.pickupAddress)
                }
                variant="secondary"
                icon={<Navigation size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
              <Button
                title={t.callPickup}
                onPress={() => callPhone(order.pickupPhone)}
                variant="secondary"
                icon={<Phone size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title="START HEADING TO PICKUP"
              onPress={() => advanceOperationalStatus('GOING_TO_PICKUP')}
              loading={actionLoading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Flow 3: GOING TO PICKUP -> ARRIVED AT PICKUP */}
        {order.status === 'GOING_TO_PICKUP' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>EN ROUTE TO PICKUP</Text>
            <Text style={styles.stageSub}>{order.pickupAddress}</Text>
            <Button
              title={t.confirmArrivalPickup}
              onPress={() => advanceOperationalStatus('ARRIVED_AT_PICKUP')}
              loading={actionLoading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Flow 4: ARRIVED AT PICKUP -> CONFIRM PICKUP */}
        {order.status === 'ARRIVED_AT_PICKUP' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>PACKAGE COLLECTION</Text>
            <Text style={styles.stageSub}>Verify package contents: {order.packageDescription}</Text>
            <Button
              title={t.confirmPickup}
              onPress={() => advanceOperationalStatus('PICKED_UP')}
              loading={actionLoading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Flow 5: PICKED UP -> OUT FOR DELIVERY */}
        {order.status === 'PICKED_UP' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>PACKAGE IN CUSTODY</Text>
            <Text style={styles.stageSub}>Deliver to customer: {order.customer?.name}</Text>
            <Button
              title={t.outForDelivery}
              onPress={() => advanceOperationalStatus('OUT_FOR_DELIVERY')}
              loading={actionLoading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Flow 6: OUT FOR DELIVERY -> ARRIVED AT CUSTOMER */}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <Card highlight style={styles.stageCard}>
            <Text style={styles.stageHeading}>ON THE WAY TO CUSTOMER</Text>
            <Text style={styles.stageSub}>{order.deliveryAddress}</Text>
            <View style={styles.btnRow}>
              <Button
                title={t.navigate}
                onPress={() =>
                  openNavigation(order.deliveryLatitude, order.deliveryLongitude, order.deliveryAddress)
                }
                variant="secondary"
                icon={<Navigation size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
              <Button
                title={t.callCustomer}
                onPress={() => callPhone(order.customer?.phone || '')}
                variant="secondary"
                icon={<Phone size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
            </View>
            <Button
              title={t.confirmArrivalCustomer}
              onPress={() => advanceOperationalStatus('ARRIVED_AT_CUSTOMER')}
              loading={actionLoading}
              size="lg"
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        {/* Flow 7: ARRIVED AT CUSTOMER -> VERIFICATION & COD & COMPLETION */}
        {order.status === 'ARRIVED_AT_CUSTOMER' && (
          <View style={styles.verificationSection}>
            <Card highlight style={styles.verifyCard}>
              <View style={styles.verifyHeader}>
                <KeyRound size={22} color={COLORS.primary} />
                <Text style={styles.verifyTitle}>{t.deliveryOtp}</Text>
              </View>
              <Text style={styles.verifySubtitle}>{t.enterOtpDescription}</Text>

              {/* Dev hint badge if available */}
              {order.deliveryOtp?.plainOtpForDev && (
                <View style={styles.devHint}>
                  <Text style={styles.devHintText}>
                    💡 DEMO / CUSTOMER OTP: {order.deliveryOtp.plainOtpForDev}
                  </Text>
                </View>
              )}

              <TextInput
                style={styles.otpInput}
                placeholder="4 8 2 7"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Card>

            {/* COD Confirmation */}
            <Card style={styles.verifyCard}>
              <View style={styles.verifyHeader}>
                <Banknote size={22} color={COLORS.goldAccent} />
                <Text style={styles.verifyTitle}>{t.codAmount}</Text>
              </View>

              <View style={styles.codCompareRow}>
                <Text style={styles.codExpectedText}>
                  Expected: {t.formatCurrency(expectedCod)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>{t.collectedAmount}</Text>
              <TextInput
                style={styles.numberInput}
                value={collectedAmount}
                onChangeText={setCollectedAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />

              {difference !== 0 && (
                <View style={styles.discrepancyBox}>
                  <View style={styles.discrepancyHeader}>
                    <AlertTriangle size={16} color={COLORS.warning} />
                    <Text style={styles.discrepancyTitle}>
                      Discrepancy: {difference > 0 ? `+${difference}` : difference} EGP
                    </Text>
                  </View>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder={t.reasonPlaceholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={discrepancyReason}
                    onChangeText={setDiscrepancyReason}
                    multiline
                  />
                </View>
              )}
            </Card>

            {/* Proof of Delivery Photo */}
            <Card style={styles.verifyCard}>
              <View style={styles.verifyHeader}>
                <Camera size={22} color={COLORS.info} />
                <Text style={styles.verifyTitle}>{t.uploadProof}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setProofPhotoAttached(!proofPhotoAttached)}
                style={[styles.photoBox, proofPhotoAttached && styles.photoBoxActive]}
              >
                <Camera size={28} color={proofPhotoAttached ? COLORS.success : COLORS.textMuted} />
                <Text style={styles.photoBoxText}>
                  {proofPhotoAttached ? t.photoUploaded : 'Tap to attach delivery photo proof'}
                </Text>
              </TouchableOpacity>
            </Card>

            <Button
              title={t.confirmAndComplete}
              onPress={handleVerifyAndComplete}
              loading={actionLoading}
              size="lg"
              variant="success"
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* Order Info Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer:</Text>
            <Text style={styles.summaryVal}>{order.customer?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phone:</Text>
            <Text style={styles.summaryVal}>{order.customer?.phone}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package:</Text>
            <Text style={styles.summaryVal}>{order.packageDescription}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fee:</Text>
            <Text style={styles.summaryVal}>{t.formatCurrency(order.deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment:</Text>
            <Text style={styles.summaryVal}>{order.paymentMethod}</Text>
          </View>
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>⚠️ {order.notes}</Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backBtn: {
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  stepCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  stepTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statusTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStatusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  stageCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  stageHeading: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stageSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  acceptRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.xs,
  },
  verificationSection: {
    gap: 12,
  },
  verifyCard: {
    padding: SPACING.md,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  verifyTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  verifySubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  devHint: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  devHintText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    height: 60,
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
  },
  codCompareRow: {
    marginBottom: 10,
  },
  codExpectedText: {
    color: COLORS.goldAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 12,
  },
  discrepancyBox: {
    marginTop: 10,
    backgroundColor: COLORS.warningGlow,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  discrepancyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  discrepancyTitle: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  reasonInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    color: COLORS.white,
    padding: 8,
    fontSize: 12,
    height: 60,
  },
  photoBox: {
    height: 90,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoBoxActive: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successGlow,
  },
  photoBoxText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  summaryTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  summaryVal: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  notesBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
  },
  notesText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
  },
});
