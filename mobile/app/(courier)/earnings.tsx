import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { DollarSign, CheckCircle2, Clock } from 'lucide-react-native';

export default function CourierEarningsScreen() {
  const { t } = useSettingsStore();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalEarnings: 0, totalBaseFees: 0, totalBonuses: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/earnings');
      setEarnings(res.data || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err) {
      console.warn('Failed to load earnings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const renderEarningItem = ({ item }: { item: any }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.itemOrderNum}>
            {item.order?.orderNumber || 'Order Delivery'}
          </Text>
          <Text style={styles.itemDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.itemAmount}>
          +{t.formatCurrency(item.totalEarning)}
        </Text>
      </View>

      <View style={styles.itemBreakdown}>
        <Text style={styles.itemFee}>
          Base: {t.formatCurrency(item.baseFee)}
        </Text>
        {Number(item.bonus) > 0 && (
          <Text style={styles.itemBonus}>
            Bonus: +{t.formatCurrency(item.bonus)}
          </Text>
        )}
        <View style={styles.settleBadge}>
          {item.isSettled ? (
            <Text style={styles.settledText}>✓ Settled</Text>
          ) : (
            <Text style={styles.pendingText}>⏳ Pending Payout</Text>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.tabEarnings}</Text>

        {/* Big Earnings Balance Card */}
        <Card highlight style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL RECONCILED EARNINGS</Text>
          <Text style={styles.balanceValue}>
            {t.formatCurrency(summary.totalEarnings)}
          </Text>
          <View style={styles.balanceRow}>
            <Text style={styles.subEarning}>
              Base Delivery Fees: {t.formatCurrency(summary.totalBaseFees)}
            </Text>
            {summary.totalBonuses > 0 && (
              <Text style={styles.subEarning}>
                Bonuses: {t.formatCurrency(summary.totalBonuses)}
              </Text>
            )}
          </View>
        </Card>

        <Text style={styles.historyTitle}>DELIVERY PAYOUT HISTORY</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={earnings}
            keyExtractor={(item) => item.id}
            renderItem={renderEarningItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchEarnings();
                }}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <DollarSign size={42} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No earnings recorded yet</Text>
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
  balanceCard: {
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  balanceValue: {
    color: COLORS.goldAccent,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 16,
  },
  subEarning: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  historyTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: SPACING.xl,
    gap: 10,
  },
  itemCard: {
    padding: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemOrderNum: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  itemDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  itemAmount: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '900',
  },
  itemBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  itemFee: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  itemBonus: {
    color: COLORS.goldAccent,
    fontSize: 11,
    fontWeight: '700',
  },
  settleBadge: {},
  settledText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 8,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
