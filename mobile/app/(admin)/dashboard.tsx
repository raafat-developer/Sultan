import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FastManLogo } from '../../src/components/FastManLogo';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { CompanyWorkspaceHeader } from '../../src/components/CompanyWorkspaceHeader';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { socketService } from '../../src/services/socket';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../src/constants/theme';
import {
  Package,
  Bike,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  LogOut,
  MapPin,
  TrendingUp,
  Zap,
  Activity,
  Layers,
  Filter,
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t, colors, language } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeZone, setActiveZone] = useState('ALL');

  const zones = [
    { id: 'ALL', nameAr: 'جميع النطاقات', nameEn: 'All Hubs' },
    { id: 'DOWNTOWN', nameAr: 'وسط البلد', nameEn: 'Downtown' },
    { id: 'NASR_CITY', nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
    { id: 'NEW_CAIRO', nameAr: 'التجمع الخامس', nameEn: 'New Cairo' },
    { id: 'MAADI', nameAr: 'المعادي', nameEn: 'Maadi' },
    { id: 'OCTOBER', nameAr: '6 أكتوبر', nameEn: '6th October' },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsRes, ordersRes] = await Promise.all([
        api.get('/reports/summary?range=today'),
        api.get('/orders?limit=5'),
      ]);
      setSummary(reportsRes.data);
      setRecentOrders(ordersRes.data);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    socketService.joinDispatchers();
    socketService.on('order.created', () => fetchDashboardData());
    socketService.on('order.status_changed', () => fetchDashboardData());

    return () => {
      socketService.off('order.created');
      socketService.off('order.status_changed');
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <FastManLogo size="sm" subtitle={false} />
          <View style={styles.headerRight}>
            <ThemeToggle />
            <LanguageToggle />
            <TouchableOpacity
              onPress={async () => {
                await logout();
                router.replace('/(auth)/login');
              }}
              style={[styles.logoutIconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <LogOut size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tenant B2B SaaS Company Workspace Bar */}
        <CompanyWorkspaceHeader />

        {/* Staff Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={[styles.welcomeName, { color: colors.text }]}>
              {user?.name || 'Administrator'}
            </Text>
            <Text style={[styles.roleTitle, { color: colors.textSecondary }]}>
              {user?.roles?.join(' • ') || 'CENTRAL DISPATCH COMMAND'}
            </Text>
          </View>
          <Button
            title={t.newOrder}
            onPress={() => router.push('/(admin)/orders/create')}
            size="sm"
            style={styles.newOrderBtn}
          />
        </View>

        {/* Commercial Hub & Zone Filter Chips */}
        <View style={styles.zonesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.zonesScroll}>
            {zones.map((zone) => {
              const isActive = activeZone === zone.id;
              return (
                <TouchableOpacity
                  key={zone.id}
                  onPress={() => setActiveZone(zone.id)}
                  style={[
                    styles.zoneChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surfaceElevated,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.zoneChipText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {language === 'ar' ? zone.nameAr : zone.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Fleet SLA & Dispatch Telemetry Card */}
        <Card style={styles.telemetryCard}>
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Zap size={14} color={colors.success} />
                <Text style={[styles.telemetryLabel, { color: colors.textMuted }]}>
                  {language === 'ar' ? 'التزام SLA العام' : 'Fleet SLA Rate'}
                </Text>
              </View>
              <Text style={[styles.telemetryValue, { color: colors.success }]}>98.4%</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>ضمن الوقت المحدد 🟢</Text>
            </View>

            <View style={[styles.telemetryDivider, { backgroundColor: colors.border }]} />

            <View style={styles.telemetryItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Bike size={14} color={colors.info} />
                <Text style={[styles.telemetryLabel, { color: colors.textMuted }]}>
                  {language === 'ar' ? 'تشغيل الأسطول' : 'Fleet Capacity'}
                </Text>
              </View>
              <Text style={[styles.telemetryValue, { color: colors.text }]}>85%</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>18 دراجة على الطريق</Text>
            </View>

            <View style={[styles.telemetryDivider, { backgroundColor: colors.border }]} />

            <View style={styles.telemetryItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Activity size={14} color={colors.goldAccent} />
                <Text style={[styles.telemetryLabel, { color: colors.textMuted }]}>
                  {language === 'ar' ? 'التوزيع الذكي' : 'Auto Routing'}
                </Text>
              </View>
              <Text style={[styles.telemetryValue, { color: colors.goldAccent }]}>نشط ⚡</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>AI Dispatching</Text>
            </View>
          </View>
        </Card>

        {loading && !summary ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              <Card style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <Package size={18} color={COLORS.primary} />
                  <Text style={styles.kpiLabel}>{t.todayOrders}</Text>
                </View>
                <Text style={styles.kpiValue}>{summary?.kpis?.totalOrders || 0}</Text>
              </Card>

              <Card style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <TrendingUp size={18} color={COLORS.warning} />
                  <Text style={styles.kpiLabel}>{t.activeDeliveries}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: COLORS.warning }]}>
                  {summary?.kpis?.activeDeliveries || 0}
                </Text>
              </Card>

              <Card style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <Bike size={18} color={COLORS.success} />
                  <Text style={styles.kpiLabel}>{t.availableCouriers}</Text>
                </View>
                <Text style={[styles.kpiValue, { color: COLORS.success }]}>
                  {summary?.kpis?.availableCouriers || 0}
                </Text>
              </Card>

              <Card style={styles.kpiCard}>
                <View style={styles.kpiHeader}>
                  <CheckCircle2 size={18} color={COLORS.info} />
                  <Text style={styles.kpiLabel}>{t.deliveredToday}</Text>
                </View>
                <Text style={styles.kpiValue}>{summary?.kpis?.delivered || 0}</Text>
              </Card>
            </View>

            {/* Financial Highlight Card */}
            <Card highlight style={styles.revenueCard}>
              <View style={styles.revenueRow}>
                <View>
                  <Text style={styles.revenueLabel}>{t.fleetRevenue}</Text>
                  <Text style={styles.revenueValue}>
                    {t.formatCurrency(summary?.financials?.totalRevenue || 0)}
                  </Text>
                </View>
                <DollarSign size={32} color={COLORS.goldAccent} />
              </View>

              <View style={styles.financialDivider} />

              <View style={styles.financialBreakdown}>
                <Text style={styles.financialSub}>
                  Fees: {t.formatCurrency(summary?.financials?.deliveryFees || 0)}
                </Text>
                <Text style={styles.financialSub}>
                  COD: {t.formatCurrency(summary?.financials?.codCollected || 0)}
                </Text>
                <Text style={styles.financialProfit}>
                  Net Profit: {t.formatCurrency(summary?.financials?.netCompanyProfit || 0)}
                </Text>
              </View>
            </Card>

            {/* Quick Actions Bar */}
            <View style={styles.quickActionsBar}>
              <Button
                title={t.tabTracking}
                onPress={() => router.push('/(admin)/tracking')}
                variant="secondary"
                size="sm"
                icon={<MapPin size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
              <Button
                title={t.tabOrders}
                onPress={() => router.push('/(admin)/orders' as any)}
                variant="secondary"
                size="sm"
                icon={<Package size={16} color={COLORS.white} />}
                style={{ flex: 1 }}
              />
            </View>

            {/* Recent Orders Section */}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENT ACTIVE ORDERS</Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/orders' as any)}>
                <Text style={styles.seeAllText}>See all ({summary?.kpis?.totalOrders || 0})</Text>
              </TouchableOpacity>
            </View>

            {recentOrders.map((ord) => (
              <TouchableOpacity
                key={ord.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/order/${ord.id}`)}
              >
                <Card style={styles.recentOrderCard}>
                  <View style={styles.recentHeader}>
                    <View>
                      <Text style={[styles.recentOrderNum, { color: colors.text }]}>{ord.orderNumber}</Text>
                      <Text style={[styles.recentCustomer, { color: colors.textSecondary }]}>{ord.customer?.name}</Text>
                    </View>
                    <Badge status={ord.status} />
                  </View>
                  <View style={styles.recentFooter}>
                    <Text style={[styles.recentCourier, { color: colors.textMuted }]}>
                      🛵 Courier: {ord.courier?.user?.name || 'Unassigned'}
                    </Text>
                    <Text style={styles.recentFee}>
                      {t.formatCurrency(ord.deliveryFee)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutIconBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  welcomeName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  roleTitle: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  newOrderBtn: {
    paddingHorizontal: 16,
  },
  zonesContainer: {
    marginBottom: SPACING.md,
  },
  zonesScroll: {
    gap: 8,
  },
  zoneChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  zoneChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  telemetryCard: {
    marginBottom: SPACING.md,
    padding: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  telemetryValue: {
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 2,
  },
  telemetrySub: {
    fontSize: 9,
    fontWeight: '600',
  },
  telemetryDivider: {
    width: 1,
    height: 36,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  kpiCard: {
    width: '48%',
    padding: SPACING.md,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  kpiLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  kpiValue: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  revenueCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  revenueValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  financialDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  financialBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  financialProfit: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '800',
  },
  quickActionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  recentOrderCard: {
    padding: SPACING.md,
    marginBottom: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recentOrderNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  recentCustomer: {
    fontSize: 12,
    marginTop: 2,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    marginTop: 4,
  },
  recentCourier: {
    fontSize: 11,
  },
  recentFee: {
    color: COLORS.goldAccent,
    fontSize: 13,
    fontWeight: '800',
  },
  centerBox: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
});
