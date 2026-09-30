import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { Order } from '../../src/types';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import {
  ArrowLeft,
  Phone,
  Navigation,
  Clock,
  User,
  Store,
  MapPin,
  CheckCircle,
  FileText,
} from 'lucide-react-native';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useSettingsStore();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.warn('Order fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const callPhone = (num: string) => Linking.openURL(`tel:${num}`);
  const openNav = (lat: number, lng: number, addr: string) => {
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(addr)}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${encodeURIComponent(addr)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerBox}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerBox}>
        <Text style={styles.errorText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{order.orderNumber}</Text>
          <Badge status={order.status} />
        </View>

        {/* Financial & COD Card */}
        <Card highlight style={styles.card}>
          <Text style={styles.cardSectionTitle}>PAYMENT & RECONCILIATION</Text>
          <View style={styles.financeGrid}>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>Delivery Fee</Text>
              <Text style={styles.financeVal}>{t.formatCurrency(order.deliveryFee)}</Text>
            </View>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>COD Amount</Text>
              <Text style={[styles.financeVal, { color: COLORS.goldAccent }]}>
                {t.formatCurrency(order.codAmount || 0)}
              </Text>
            </View>
            <View style={styles.financeItem}>
              <Text style={styles.financeLabel}>Payment Mode</Text>
              <Text style={styles.financeVal}>{order.paymentMethod}</Text>
            </View>
          </View>

          {order.cashCollection && (
            <View style={styles.collectionStatusBox}>
              <Text style={styles.collectionStatusText}>
                Cash Collection: {order.cashCollection.status} • Collected:{' '}
                {t.formatCurrency(order.cashCollection.collectedAmount)}
              </Text>
            </View>
          )}
        </Card>

        {/* Merchant & Customer Routing */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>PICKUP & DROP-OFF</Text>

          <View style={styles.locationBlock}>
            <View style={styles.locationHeader}>
              <Store size={16} color={COLORS.info} />
              <Text style={styles.locationTitle}>{order.pickupName}</Text>
            </View>
            <Text style={styles.locationAddress}>{order.pickupAddress}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.miniBtn}
                onPress={() => callPhone(order.pickupPhone)}
              >
                <Phone size={12} color={COLORS.white} />
                <Text style={styles.miniBtnText}>Call Store</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.miniBtn}
                onPress={() =>
                  openNav(order.pickupLatitude, order.pickupLongitude, order.pickupAddress)
                }
              >
                <Navigation size={12} color={COLORS.white} />
                <Text style={styles.miniBtnText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationBlock}>
            <View style={styles.locationHeader}>
              <User size={16} color={COLORS.primary} />
              <Text style={styles.locationTitle}>{order.customer?.name}</Text>
            </View>
            <Text style={styles.locationAddress}>{order.deliveryAddress}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.miniBtn}
                onPress={() => callPhone(order.customer?.phone)}
              >
                <Phone size={12} color={COLORS.white} />
                <Text style={styles.miniBtnText}>Call Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.miniBtn}
                onPress={() =>
                  openNav(order.deliveryLatitude, order.deliveryLongitude, order.deliveryAddress)
                }
              >
                <Navigation size={12} color={COLORS.white} />
                <Text style={styles.miniBtnText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Courier Info */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>ASSIGNED COURIER</Text>
          {order.courier ? (
            <View style={styles.courierRow}>
              <View>
                <Text style={styles.courierName}>{order.courier.user?.name}</Text>
                <Text style={styles.courierMeta}>
                  🛵 {order.courier.vehicleType} • {order.courier.plateNumber || 'No Plate'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.miniBtn}
                onPress={() => callPhone(order.courier.user?.phone)}
              >
                <Phone size={12} color={COLORS.white} />
                <Text style={styles.miniBtnText}>Call Courier</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.unassignedText}>No courier currently assigned</Text>
          )}
        </Card>

        {/* Status History Timeline */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>STATUS HISTORY TIMELINE</Text>
          {order.statusHistory?.map((hist: any, index: number) => (
            <View key={hist.id || index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineStatus}>{hist.toStatus}</Text>
                  <Text style={styles.timelineTime}>
                    {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {hist.reason && <Text style={styles.timelineReason}>{hist.reason}</Text>}
                {hist.changedBy && (
                  <Text style={styles.timelineAuthor}>By: {hist.changedBy.name}</Text>
                )}
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centerBox: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
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
  headerTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardSectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  financeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeItem: {},
  financeLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  financeVal: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  collectionStatusBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },
  collectionStatusText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  locationBlock: {
    gap: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  locationAddress: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  courierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courierName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  courierMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  unassignedText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStatus: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  timelineTime: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  timelineReason: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  timelineAuthor: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
  },
});
