import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { socketService } from '../../src/services/socket';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import {
  MapPin,
  Bike,
  Battery,
  Navigation,
  Phone,
  Clock,
  Radio,
} from 'lucide-react-native';

export default function AdminTrackingScreen() {
  const { t } = useSettingsStore();

  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);

  const fetchLiveFleet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tracking/couriers/live');
      setCouriers(res.data);
      if (res.data.length > 0 && !selectedCourier) {
        setSelectedCourier(res.data[0]);
      }
    } catch (err) {
      console.warn('Live tracking fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFleet();

    socketService.joinDispatchers();
    socketService.on('courier.location_updated', (data) => {
      setCouriers((prev) =>
        prev.map((c) =>
          c.id === data.courierId
            ? {
                ...c,
                location: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  updatedAt: data.timestamp,
                },
                batteryLevel: data.batteryLevel ?? c.batteryLevel,
              }
            : c,
        ),
      );
    });

    socketService.on('courier.online', () => fetchLiveFleet());
    socketService.on('courier.offline', () => fetchLiveFleet());

    return () => {
      socketService.off('courier.location_updated');
      socketService.off('courier.online');
      socketService.off('courier.offline');
    };
  }, []);

  const openMapPin = (lat: number, lng: number, label: string) => {
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(label)}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${encodeURIComponent(label)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    if (url) Linking.openURL(url);
  };

  const renderCourierRow = ({ item }: { item: any }) => {
    const isSelected = selectedCourier?.id === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedCourier(item)}
      >
        <Card style={StyleSheet.flatten([styles.courierCard, isSelected && styles.selectedCourierCard])}>
          <View style={styles.courierTop}>
            <View style={styles.nameGroup}>
              <View style={[styles.statusDot, { backgroundColor: item.status === 'AVAILABLE' ? COLORS.success : item.status === 'BUSY' ? COLORS.warning : COLORS.textMuted }]} />
              <Text style={styles.courierName}>{item.name}</Text>
            </View>
            <Badge status={item.status} />
          </View>

          <View style={styles.courierMeta}>
            <Text style={styles.courierSub}>
              🛵 {item.vehicleType} • {item.plateNumber || 'No Plate'}
            </Text>
            {item.batteryLevel !== null && item.batteryLevel !== undefined && (
              <View style={styles.batteryRow}>
                <Battery size={14} color={COLORS.textMuted} />
                <Text style={styles.batteryText}>{item.batteryLevel}%</Text>
              </View>
            )}
          </View>

          {item.currentOrder && (
            <View style={styles.activeOrderBox}>
              <Text style={styles.activeOrderNum}>
                Active: {item.currentOrder.orderNumber}
              </Text>
              <Text style={styles.activeOrderAddress} numberOfLines={1}>
                Dropoff: {item.currentOrder.deliveryAddress}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Radio size={20} color={COLORS.primary} />
            <Text style={styles.title}>LIVE FLEET TRACKING</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.blinkingDot} />
            <Text style={styles.liveText}>REALTIME</Text>
          </View>
        </View>

        {/* Selected Courier Detail Banner */}
        {selectedCourier && (
          <Card highlight style={styles.detailBanner}>
            <View style={styles.bannerHeader}>
              <View>
                <Text style={styles.bannerTitle}>{selectedCourier.name}</Text>
                <Text style={styles.bannerPhone}>📞 {selectedCourier.phone}</Text>
              </View>
              <Badge status={selectedCourier.status} />
            </View>

            {selectedCourier.location ? (
              <View style={styles.locationBox}>
                <View style={styles.locationCoords}>
                  <MapPin size={16} color={COLORS.primary} />
                  <Text style={styles.coordsText}>
                    GPS: {selectedCourier.location.latitude.toFixed(4)},{' '}
                    {selectedCourier.location.longitude.toFixed(4)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    openMapPin(
                      selectedCourier.location.latitude,
                      selectedCourier.location.longitude,
                      selectedCourier.name,
                    )
                  }
                  style={styles.openMapBtn}
                >
                  <Navigation size={14} color={COLORS.white} />
                  <Text style={styles.openMapText}>Open Map App</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noGpsText}>No active GPS coordinates reported yet.</Text>
            )}
          </Card>
        )}

        <Text style={styles.listHeading}>
          ALL MOTORCYCLE COURIERS ({couriers.length})
        </Text>

        {loading && couriers.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={couriers}
            keyExtractor={(item) => item.id}
            renderItem={renderCourierRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchLiveFleet();
                }}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  blinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  detailBanner: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  bannerPhone: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  locationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  locationCoords: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  openMapText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  noGpsText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  listHeading: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: 8,
  },
  courierCard: {
    padding: SPACING.md,
  },
  selectedCourierCard: {
    borderColor: COLORS.primary,
  },
  courierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courierName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  courierMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courierSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  activeOrderBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  activeOrderNum: {
    color: COLORS.goldAccent,
    fontSize: 12,
    fontWeight: '800',
  },
  activeOrderAddress: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
