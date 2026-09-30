import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { BarChart3, TrendingUp, CheckCircle, XCircle, DollarSign } from 'lucide-react-native';

export default function AdminReportsScreen() {
  const { t } = useSettingsStore();

  const [range, setRange] = useState<'today' | 'week' | 'month'>('today');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/summary?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.warn('Reports fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.title}>{t.tabReports}</Text>

        {/* Range Tabs */}
        <View style={styles.tabBar}>
          {(['today', 'week', 'month'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[styles.tabItem, range === r && styles.activeTabItem]}
            >
              <Text style={[styles.tabText, range === r && styles.activeTabText]}>
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !data ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Net Profit Card */}
            <Card highlight style={styles.profitCard}>
              <Text style={styles.profitLabel}>NET COMPANY PROFIT</Text>
              <Text style={styles.profitValue}>
                {t.formatCurrency(data?.financials?.netCompanyProfit || 0)}
              </Text>
              <Text style={styles.profitSub}>
                Success Delivery Rate: {data?.kpis?.successRatePercentage || 100}%
              </Text>
            </Card>

            {/* Volume Breakdown Card */}
            <Card style={styles.card}>
              <Text style={styles.cardHeading}>ORDERS VOLUME & FULFILLMENT</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Orders:</Text>
                <Text style={styles.metricVal}>{data?.kpis?.totalOrders || 0}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Delivered Successfully:</Text>
                <Text style={[styles.metricVal, { color: COLORS.success }]}>
                  {data?.kpis?.delivered || 0}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Failed Deliveries:</Text>
                <Text style={[styles.metricVal, { color: COLORS.danger }]}>
                  {data?.kpis?.failed || 0}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Cancelled:</Text>
                <Text style={styles.metricVal}>{data?.kpis?.cancelled || 0}</Text>
              </View>
            </Card>

            {/* Financial Ledger Card */}
            <Card style={styles.card}>
              <Text style={styles.cardHeading}>FINANCIAL BREAKDOWN</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Fleet Turnover:</Text>
                <Text style={styles.metricVal}>
                  {t.formatCurrency(data?.financials?.totalRevenue || 0)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Gross Delivery Fees:</Text>
                <Text style={styles.metricVal}>
                  {t.formatCurrency(data?.financials?.deliveryFees || 0)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Courier Commissions:</Text>
                <Text style={[styles.metricVal, { color: COLORS.goldAccent }]}>
                  -{t.formatCurrency(data?.financials?.courierEarnings || 0)}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>COD Cash Flow:</Text>
                <Text style={styles.metricVal}>
                  {t.formatCurrency(data?.financials?.codCollected || 0)}
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
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
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.white,
  },
  profitCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profitLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profitValue: {
    color: COLORS.success,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 6,
  },
  profitSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: 10,
  },
  cardHeading: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  metricVal: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  centerBox: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
});
