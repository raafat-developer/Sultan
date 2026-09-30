import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { Order, OrderStatus } from '../../src/types';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { Package, ChevronRight, MapPin } from 'lucide-react-native';

export default function CourierOrdersScreen() {
  const router = useRouter();
  const { t } = useSettingsStore();

  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?limit=50');
      setOrders(res.data);
    } catch (err) {
      console.warn('Failed to load courier orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (tab === 'completed') {
      return o.status === 'DELIVERED';
    }
    return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
  });

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(courier)/delivery/${item.id}`)}
    >
      <Card style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNum}>{item.orderNumber}</Text>
            <Text style={styles.pkgText}>{item.packageDescription}</Text>
          </View>
          <Badge status={item.status} />
        </View>

        <View style={styles.addressSection}>
          <View style={styles.addressRow}>
            <MapPin size={14} color={COLORS.primary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.deliveryAddress}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.feeLabel}>COD Amount</Text>
            <Text style={styles.feeVal}>{t.formatCurrency(item.codAmount || 0)}</Text>
          </View>
          <ChevronRight size={18} color={COLORS.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.tabOrders}</Text>

        {/* Filter Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'active' && styles.activeTabItem]}
            onPress={() => setTab('active')}
          >
            <Text style={[styles.tabText, tab === 'active' && styles.activeTabText]}>
              Active / In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'completed' && styles.activeTabItem]}
            onPress={() => setTab('completed')}
          >
            <Text style={[styles.tabText, tab === 'completed' && styles.activeTabText]}>
              {t.completed}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Package size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No orders in this category</Text>
              </View>
            }
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textMuted,
    fontWeight: '800',
    fontSize: 13,
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: 10,
  },
  orderCard: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderNum: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  pkgText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addressSection: {
    marginVertical: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  feeLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  feeVal: {
    color: COLORS.goldAccent,
    fontSize: 14,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
