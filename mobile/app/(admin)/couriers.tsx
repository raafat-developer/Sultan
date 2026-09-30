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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { Courier } from '../../src/types';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { Bike, Phone, Mail, ShieldCheck } from 'lucide-react-native';

export default function AdminCouriersScreen() {
  const { t } = useSettingsStore();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/couriers?limit=50');
      setCouriers(res.data);
    } catch (err) {
      console.warn('Couriers fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const callCourier = (phone: string) => Linking.openURL(`tel:${phone}`);

  const renderCourierItem = ({ item }: { item: Courier }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Bike size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.name}>{item.user?.name}</Text>
            <Text style={styles.vehicle}>
              {item.vehicleType} • {item.plateNumber || 'No Plate'}
            </Text>
          </View>
        </View>
        <Badge status={item.status} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.phoneText}>📞 {item.user?.phone}</Text>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => callCourier(item.user?.phone)}
        >
          <Phone size={14} color={COLORS.white} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.tabCouriers}</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={couriers}
            keyExtractor={(item) => item.id}
            renderItem={renderCourierItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchCouriers();
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
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginVertical: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: 10,
  },
  card: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  vehicle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  phoneText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
