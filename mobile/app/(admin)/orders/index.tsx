import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Badge } from '../../../src/components/Badge';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { api } from '../../../src/services/api';
import { Order, Courier, OrderStatus } from '../../../src/types';
import { COLORS, RADIUS, SPACING } from '../../../src/constants/theme';
import {
  Search,
  Plus,
  UserCheck,
  X,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react-native';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { t } = useSettingsStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Assign Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/orders?limit=50`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;

      const [ordersRes, couriersRes] = await Promise.all([
        api.get(url),
        api.get('/couriers?limit=30'),
      ]);

      setOrders(ordersRes.data);
      setCouriers(couriersRes.data);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOpenAssign = (order: Order) => {
    setSelectedOrderForAssign(order);
    setAssignModalVisible(true);
  };

  const handleConfirmAssign = async (courierId: string) => {
    if (!selectedOrderForAssign) return;
    setAssignLoading(true);
    try {
      await api.post(`/orders/${selectedOrderForAssign.id}/assign`, { courierId });
      Alert.alert('✅ Assigned', `Order assigned to courier successfully.`);
      setAssignModalVisible(false);
      fetchOrders();
    } catch (err: any) {
      Alert.alert(t.error, err.message || 'Assignment failed.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filterChips = [
    { label: 'All', value: 'ALL' },
    { label: 'New', value: 'NEW' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'On Route', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/order/${item.id}`)}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNum}>{item.orderNumber}</Text>
            <Text style={styles.customerName}>
              👤 {item.customer?.name} ({item.customer?.phone})
            </Text>
          </View>
          <Badge status={item.status} />
        </View>

        <View style={styles.routeBox}>
          <Text style={styles.routeItem} numberOfLines={1}>
            🏬 Pickup: {item.pickupName}
          </Text>
          <Text style={styles.routeItem} numberOfLines={1}>
            📍 Dropoff: {item.deliveryAddress}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.courierInfo}>
              🛵 Courier: {item.courier?.user?.name || 'Unassigned'}
            </Text>
            <Text style={styles.codAmount}>
              COD: {t.formatCurrency(item.codAmount || 0)} • Fee: {t.formatCurrency(item.deliveryFee)}
            </Text>
          </View>

          {item.status === 'NEW' || item.status === 'ASSIGNED' ? (
            <Button
              title="Assign"
              onPress={() => handleOpenAssign(item)}
              size="sm"
              icon={<UserCheck size={14} color={COLORS.white} />}
            />
          ) : (
            <ChevronRight size={18} color={COLORS.textMuted} />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topRow}>
          <Text style={styles.title}>{t.tabOrders}</Text>
          <Button
            title={t.newOrder}
            onPress={() => router.push('/(admin)/orders/create')}
            size="sm"
            icon={<Plus size={16} color={COLORS.white} />}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchOrders}
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchOrders}
            returnKeyType="search"
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsRow}>
          {filterChips.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setSelectedStatus(c.value)}
              style={[
                styles.chip,
                selectedStatus === c.value && styles.activeChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedStatus === c.value && styles.activeChipText,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Courier Assignment Modal */}
        <Modal visible={assignModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Assign Order {selectedOrderForAssign?.orderNumber}</Text>
                <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                  <X size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>{t.selectCourier}:</Text>

              {assignLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
              ) : (
                <FlatList
                  data={couriers}
                  keyExtractor={(c) => c.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.courierSelectCard}
                      onPress={() => handleConfirmAssign(item.id)}
                    >
                      <View>
                        <Text style={styles.courierName}>{item.user?.name}</Text>
                        <Text style={styles.courierPlate}>
                          🛵 {item.vehicleType} • {item.plateNumber || 'No Plate'}
                        </Text>
                      </View>
                      <Badge status={item.status} />
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  activeChipText: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: 10,
  },
  orderCard: {
    padding: SPACING.md,
  },
  orderHeader: {
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
  customerName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: COLORS.surfaceElevated,
    padding: 8,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginVertical: 6,
  },
  routeItem: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  courierInfo: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  codAmount: {
    color: COLORS.goldAccent,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  courierSelectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courierName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  courierPlate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
