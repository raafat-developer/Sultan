import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FastManLogo } from '../../src/components/FastManLogo';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { useAuthStore } from '../../src/store/authStore';
import { useCourierStore } from '../../src/store/courierStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { LocationService } from '../../src/services/location';
import { socketService } from '../../src/services/socket';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import {
  Power,
  Navigation,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
  MapPin,
  ArrowRight,
} from 'lucide-react-native';

export default function CourierHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { status, setStatus, currentDelivery, setCurrentDelivery } = useCourierStore();
  const { t, isRTL } = useSettingsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    completedToday: 0,
    pendingToday: 0,
    todayEarnings: 0,
  });

  const isOnline = status === 'AVAILABLE' || status === 'BUSY';

  const fetchStats = async () => {
    try {
      const res = await api.get('/couriers/me/stats');
      const data = res.data;
      setStatus(data.status);
      setStats({
        todayOrders: data.todayOrders,
        completedToday: data.completedToday,
        pendingToday: data.pendingToday,
        todayEarnings: data.todayEarnings,
      });
      setCurrentDelivery(data.currentDelivery || null);

      if (data.status !== 'OFFLINE') {
        LocationService.startTracking(data.currentDelivery?.id);
      }
    } catch (err) {
      console.warn('Failed to fetch courier stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for real-time order assignments
    if (user?.courierId) {
      socketService.joinCourier(user.courierId);
      socketService.on('order.assigned', (payload) => {
        Alert.alert('📦 New Order Assigned!', `Order ${payload.orderNumber} assigned to you.`);
        fetchStats();
      });
    }

    return () => {
      socketService.off('order.assigned');
    };
  }, [user]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const toggleAvailability = async () => {
    setIsTogglingStatus(true);
    const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
    try {
      await api.post('/couriers/status', { status: newStatus });
      setStatus(newStatus);
      if (newStatus === 'OFFLINE') {
        LocationService.stopTracking();
      } else {
        LocationService.startTracking(currentDelivery?.id);
      }
    } catch (err: any) {
      Alert.alert(t.error, err.message || 'Failed to update availability.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const openNavigation = (lat: number, lng: number, address: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(address);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <FastManLogo size="sm" subtitle={false} />
          <View style={styles.headerActions}>
            <LanguageToggle />
          </View>
        </View>

        {/* Courier Big Status Banner & Toggle */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.welcomeText}>
                {user?.name ? `${t.welcomeBack}, ${user.name.split(' ')[0]}` : 'Courier'}
              </Text>
              <Text style={styles.vehicleInfo}>
                🛵 {user?.vehicleType || 'MOTORCYCLE'} {user?.plateNumber ? `• ${user.plateNumber}` : ''}
              </Text>
            </View>
            <Badge status={status} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleAvailability}
            disabled={isTogglingStatus}
            style={[
              styles.toggleBtn,
              isOnline ? styles.toggleBtnOnline : styles.toggleBtnOffline,
            ]}
          >
            <Power size={22} color={COLORS.white} />
            <Text style={styles.toggleBtnText}>
              {isOnline ? t.online : t.offline}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.statNumber}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>{t.todayOrders}</Text>
          </Card>

          <Card style={styles.statBox}>
            <CheckCircle2 size={20} color={COLORS.success} />
            <Text style={styles.statNumber}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>{t.completed}</Text>
          </Card>

          <Card style={styles.statBox}>
            <Clock size={20} color={COLORS.warning} />
            <Text style={styles.statNumber}>{stats.pendingToday}</Text>
            <Text style={styles.statLabel}>{t.pending}</Text>
          </Card>

          <Card style={styles.statBox}>
            <DollarSign size={20} color={COLORS.goldAccent} />
            <Text style={styles.statNumber}>{stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>{t.currency}</Text>
          </Card>
        </View>

        {/* Current Active Delivery Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.currentDelivery}</Text>
        </View>

        {currentDelivery ? (
          <Card highlight style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View>
                <Text style={styles.orderNumber}>{currentDelivery.orderNumber}</Text>
                <Text style={styles.packageDesc}>{currentDelivery.packageDescription}</Text>
              </View>
              <Badge status={currentDelivery.status} />
            </View>

            {/* Route Points */}
            <View style={styles.routeContainer}>
              {/* Pickup Point */}
              <View style={styles.routePoint}>
                <View style={[styles.dotMarker, { backgroundColor: COLORS.info }]} />
                <View style={styles.routeTextCol}>
                  <Text style={styles.routeLabel}>{t.confirmArrivalPickup}</Text>
                  <Text style={styles.routeMain}>{currentDelivery.pickupName}</Text>
                  <Text style={styles.routeSub}>{currentDelivery.pickupAddress}</Text>
                </View>
              </View>

              <View style={styles.routeDivider} />

              {/* Delivery Point */}
              <View style={styles.routePoint}>
                <View style={[styles.dotMarker, { backgroundColor: COLORS.primary }]} />
                <View style={styles.routeTextCol}>
                  <Text style={styles.routeLabel}>{t.confirmArrivalCustomer}</Text>
                  <Text style={styles.routeMain}>{currentDelivery.customer?.name || 'Customer'}</Text>
                  <Text style={styles.routeSub}>{currentDelivery.deliveryAddress}</Text>
                </View>
              </View>
            </View>

            {/* COD Bar */}
            <View style={styles.codBar}>
              <Text style={styles.codLabel}>{t.codAmount}</Text>
              <Text style={styles.codValue}>
                {t.formatCurrency(currentDelivery.codAmount || 0)}
              </Text>
            </View>

            {/* Operational Actions */}
            <View style={styles.actionRow}>
              <Button
                title={t.navigate}
                onPress={() =>
                  openNavigation(
                    currentDelivery.deliveryLatitude,
                    currentDelivery.deliveryLongitude,
                    currentDelivery.deliveryAddress,
                  )
                }
                variant="secondary"
                size="sm"
                icon={<Navigation size={16} color={COLORS.white} />}
                style={styles.actionBtn}
              />

              <Button
                title={t.callCustomer}
                onPress={() => callPhone(currentDelivery.customer?.phone || currentDelivery.pickupPhone)}
                variant="secondary"
                size="sm"
                icon={<Phone size={16} color={COLORS.white} />}
                style={styles.actionBtn}
              />
            </View>

            {/* Primary Action Button */}
            <Button
              title={
                currentDelivery.status === 'ASSIGNED'
                  ? t.acceptOrder
                  : currentDelivery.status === 'ARRIVED_AT_CUSTOMER'
                  ? t.verifyDelivery
                  : t.nextStep
              }
              onPress={() => router.push(`/(courier)/delivery/${currentDelivery.id}`)}
              size="lg"
              style={styles.primaryActionBtn}
              icon={<ArrowRight size={18} color={COLORS.white} />}
            />
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Package size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t.noActiveDelivery}</Text>
            <Text style={styles.emptyDesc}>
              {isOnline ? t.waitingOrders : t.goOnlinePrompt}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  welcomeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  vehicleInfo: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: RADIUS.md,
  },
  toggleBtnOnline: {
    backgroundColor: COLORS.success,
    ...SHADOWS.md,
  },
  toggleBtnOffline: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 4,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deliveryCard: {
    padding: SPACING.md,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderNumber: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  packageDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  routeContainer: {
    marginVertical: SPACING.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeDivider: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeTextCol: {
    flex: 1,
  },
  routeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeMain: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  routeSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  codBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    padding: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  codValue: {
    color: COLORS.goldAccent,
    fontSize: 18,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  primaryActionBtn: {
    marginTop: SPACING.xs,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: SPACING.lg,
  },
});
