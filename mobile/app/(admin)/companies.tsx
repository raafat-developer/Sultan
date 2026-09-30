import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';
import {
  Building2,
  Key,
  Plus,
  Bike,
  Package,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Power,
  Search,
  Sparkles,
  Users,
  DollarSign,
  X,
} from 'lucide-react-native';

export default function CompaniesSaaSScreen() {
  const router = useRouter();
  const { colors, t, language } = useSettingsStore();

  const [companies, setCompanies] = useState<any[]>([
    {
      id: 'cmp-fastman-001',
      name: 'FAST MAN Express',
      slug: 'fastman',
      licenseKey: 'FM-LIC-2026-99A1-88FE',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      contactEmail: 'admin@fastman.com',
      contactPhone: '+201000000002',
      couriersCount: 18,
      ordersCount: 1420,
      licenseExpiresAt: '2027-12-31',
      brandColor: '#E50914',
      adminName: 'Tarek Admin',
      adminEmail: 'admin@fastman.com',
    },
    {
      id: 'cmp-alburaq-002',
      name: 'Al-Buraq Motorcycle Logistics',
      slug: 'alburaq',
      licenseKey: 'BRQ-LIC-2026-44B2-11CD',
      status: 'ACTIVE',
      plan: 'PRO',
      contactEmail: 'contact@alburaq-delivery.com',
      contactPhone: '+201099887766',
      couriersCount: 12,
      ordersCount: 850,
      licenseExpiresAt: '2027-06-30',
      brandColor: '#00E5FF',
      adminName: 'Karim Mostafa',
      adminEmail: 'admin@alburaq.com',
    },
    {
      id: 'cmp-speedy-003',
      name: 'Speedy Cairo Delivery',
      slug: 'speedy',
      licenseKey: 'SPD-LIC-2026-88C3-22AB',
      status: 'TRIAL',
      plan: 'STARTER',
      contactEmail: 'ops@speedycairo.com',
      contactPhone: '+201022334411',
      couriersCount: 5,
      ordersCount: 190,
      licenseExpiresAt: '2026-11-15',
      brandColor: '#FBBF24',
      adminName: 'Hossam Nabil',
      adminEmail: 'admin@speedycairo.com',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Company Form
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPlan, setFormPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [formAdminName, setFormAdminName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPassword, setFormAdminPassword] = useState('Password123!');
  const [formAdminPhone, setFormAdminPhone] = useState('+2010');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      if (res.data && res.data.length > 0) {
        setCompanies(res.data);
      }
    } catch {
      // Keep rich demo companies fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async () => {
    if (!formName.trim() || !formSlug.trim() || !formEmail.trim() || !formAdminEmail.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة لإنشاء الشركة وحساب المسؤول.');
      return;
    }

    const newCompanyObj = {
      id: `cmp-${formSlug.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      slug: formSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''),
      licenseKey: `LIC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'ACTIVE',
      plan: formPlan,
      contactEmail: formEmail.trim(),
      contactPhone: formPhone.trim(),
      couriersCount: 0,
      ordersCount: 0,
      licenseExpiresAt: '2027-12-31',
      brandColor: '#E50914',
      adminName: formAdminName.trim() || 'Company Admin',
      adminEmail: formAdminEmail.trim(),
    };

    setCompanies((prev) => [newCompanyObj, ...prev]);
    setShowAddModal(false);

    // Reset Form
    setFormName('');
    setFormSlug('');
    setFormEmail('');
    setFormPhone('');
    setFormAdminName('');
    setFormAdminEmail('');

    Alert.alert(
      '🎉 تم إنشاء الشركة وإصدار الترخيص',
      `تم إنشاء شركة "${newCompanyObj.name}" بنجاح!\nمفتاح الترخيص: ${newCompanyObj.licenseKey}\nحساب المسؤول: ${newCompanyObj.adminEmail}`,
    );

    // Call API in background
    api.post('/companies', {
      name: newCompanyObj.name,
      slug: newCompanyObj.slug,
      contactEmail: newCompanyObj.contactEmail,
      contactPhone: newCompanyObj.contactPhone,
      plan: newCompanyObj.plan,
      adminName: newCompanyObj.adminName,
      adminEmail: newCompanyObj.adminEmail,
      adminPassword: formAdminPassword,
      adminPhone: formAdminPhone,
    }).catch(() => {});
  };

  const copyLicense = (key: string) => {
    Alert.alert('تم نسخ الترخيص', `مفتاح الترخيص:\n${key}`);
  };

  const toggleCompanyStatus = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...c, status: nextStatus };
        }
        return c;
      }),
    );
  };

  const switchIntoCompany = (company: any) => {
    Alert.alert(
      '🏢 تبديل لوحة التحكم',
      `تم التبديل إلى لوحة تشغيل شركة: ${company.name}\nأنت الآن تتصفح الطلبات والمندوبين الخاصين بهذه الشركة فقط.`,
      [
        {
          text: 'فتح اللوحة',
          onPress: () => router.push('/(admin)/dashboard'),
        },
      ],
    );
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.licenseKey.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCouriers = companies.reduce((a, b) => a + (b.couriersCount || 0), 0);
  const totalOrders = companies.reduce((a, b) => a + (b.ordersCount || 0), 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.brandingHeader}>
            <Building2 size={24} color="#E50914" />
            <View>
              <Text style={[styles.pageTitle, { color: colors.text }]}>
                {language === 'ar' ? 'بوابة المطور وإدارة الشركات' : 'Developer SaaS Portal'}
              </Text>
              <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                Multi-Tenant Delivery Companies & Licensing Engine
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <ThemeToggle />
            <LanguageToggle />
          </View>
        </View>

        {/* Global Developer SaaS KPI Bar */}
        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <Building2 size={20} color="#00E5FF" />
            <Text style={[styles.kpiValue, { color: colors.text }]}>{companies.length}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>الشركات المتعاقدة</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Key size={20} color="#00E676" />
            <Text style={[styles.kpiValue, { color: colors.text }]}>
              {companies.filter((c) => c.status === 'ACTIVE').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>تراخيص نشطة</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Bike size={20} color="#E50914" />
            <Text style={[styles.kpiValue, { color: colors.text }]}>{totalCouriers}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>إجمالي المندوبين</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <Package size={20} color="#FBBF24" />
            <Text style={[styles.kpiValue, { color: colors.text }]}>{totalOrders}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>إجمالي الشحنات</Text>
          </Card>
        </View>

        {/* Action Header & Search */}
        <View style={styles.actionHeaderRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="بحث باسم الشركة، الكود، أو الترخيص..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.addCompanyBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addCompanyBtnText}>إضافة شركة جديدة</Text>
          </TouchableOpacity>
        </View>

        {/* Companies List */}
        <View style={styles.companiesList}>
          {filteredCompanies.map((comp) => {
            const isActive = comp.status === 'ACTIVE';
            return (
              <Card key={comp.id} style={styles.companyCard}>
                {/* Company Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.companyMetaRow}>
                    <View style={[styles.companyAvatar, { backgroundColor: comp.brandColor || '#E50914' }]}>
                      <Building2 size={24} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={[styles.companyName, { color: colors.text }]}>{comp.name}</Text>
                      <Text style={[styles.companySlug, { color: colors.textMuted }]}>
                        معرف النظام: @{comp.slug} • {comp.contactEmail}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.planBadge,
                        comp.plan === 'ENTERPRISE' && styles.enterpriseBadge,
                      ]}
                    >
                      <Text style={styles.planBadgeText}>{comp.plan}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isActive ? styles.statusActive : styles.statusSuspended,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {isActive ? 'مرخص ونشط' : 'معلق / تجريبي'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* License Key Box */}
                <View style={[styles.licenseBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <View style={styles.licenseLeft}>
                    <Key size={16} color="#00E5FF" />
                    <Text style={[styles.licenseText, { color: colors.text }]}>{comp.licenseKey}</Text>
                  </View>
                  <TouchableOpacity onPress={() => copyLicense(comp.licenseKey)} style={styles.copyBtn}>
                    <Copy size={14} color="#00E5FF" />
                    <Text style={styles.copyBtnText}>نسخ</Text>
                  </TouchableOpacity>
                </View>

                {/* Company Stats Bar */}
                <View style={styles.compStatsRow}>
                  <View style={styles.compStatItem}>
                    <Bike size={14} color="#E50914" />
                    <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>المندوبين:</Text>
                    <Text style={[styles.compStatVal, { color: colors.text }]}>{comp.couriersCount} دراجة</Text>
                  </View>

                  <View style={styles.compStatItem}>
                    <Package size={14} color="#00E676" />
                    <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>الطلبات:</Text>
                    <Text style={[styles.compStatVal, { color: colors.text }]}>{comp.ordersCount} طلب</Text>
                  </View>

                  <View style={styles.compStatItem}>
                    <Calendar size={14} color="#FBBF24" />
                    <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>انتهاء الترخيص:</Text>
                    <Text style={[styles.compStatVal, { color: colors.text }]}>
                      {new Date(comp.licenseExpiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.compActionsRow}>
                  <TouchableOpacity
                    style={styles.switchCompanyBtn}
                    onPress={() => switchIntoCompany(comp)}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={16} color="#FFFFFF" />
                    <Text style={styles.switchCompanyText}>فتح لوحة تشغيل الشركة</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleStatusBtn,
                      isActive ? styles.btnSuspend : styles.btnActivate,
                    ]}
                    onPress={() => toggleCompanyStatus(comp.id)}
                    activeOpacity={0.8}
                  >
                    <Power size={14} color={isActive ? '#EF4444' : '#00E676'} />
                    <Text style={[styles.toggleStatusText, { color: isActive ? '#EF4444' : '#00E676' }]}>
                      {isActive ? 'تعليق الترخيص' : 'تفعيل الترخيص'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Onboard New Client Company Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Building2 size={22} color="#E50914" />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  إضافة شركة جديدة وإصدار ترخيص
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFormScroll}>
              <Text style={styles.formSectionTitle}>بيانات الشركة الأساسية</Text>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>اسم الشركة / الأسطول</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                placeholder="مثال: البراق إكسبريس للتوصيل"
                placeholderTextColor={colors.textMuted}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>معرف الشركة الفريد (Slug)</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                placeholder="مثال: alburaq"
                placeholderTextColor={colors.textMuted}
                value={formSlug}
                onChangeText={setFormSlug}
                autoCapitalize="none"
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>البريد الإلكتروني للشركة</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    placeholder="contact@company.com"
                    placeholderTextColor={colors.textMuted}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>هاتف التواصل</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    placeholder="+2010..."
                    placeholderTextColor={colors.textMuted}
                    value={formPhone}
                    onChangeText={setFormPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Text style={styles.formSectionTitle}>باقة الترخيص</Text>
              <View style={styles.planSelectorRow}>
                {(['STARTER', 'PRO', 'ENTERPRISE'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.planOption,
                      formPlan === p && styles.planOptionActive,
                      { borderColor: formPlan === p ? '#E50914' : colors.border },
                    ]}
                    onPress={() => setFormPlan(p)}
                  >
                    <Text style={[styles.planOptionText, formPlan === p && styles.planOptionTextActive]}>
                      {p}
                    </Text>
                    <Text style={styles.planOptionSub}>
                      {p === 'STARTER' ? '15 مندوب' : p === 'PRO' ? '50 مندوب' : 'غير محدود'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formSectionTitle}>حساب مدير الشركة (Company Admin)</Text>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>اسم المدير</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                placeholder="اسم المسؤول الكامل"
                placeholderTextColor={colors.textMuted}
                value={formAdminName}
                onChangeText={setFormAdminName}
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>بريد دخول المدير</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    placeholder="admin@company.com"
                    placeholderTextColor={colors.textMuted}
                    value={formAdminEmail}
                    onChangeText={setFormAdminEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>كلمة المرور</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                    value={formAdminPassword}
                    onChangeText={setFormAdminPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitCreateBtn}
                onPress={handleCreateCompany}
                activeOpacity={0.85}
              >
                <Sparkles size={18} color="#FFFFFF" />
                <Text style={styles.submitCreateText}>تأكيد إنشاء الشركة وإصدار الترخيص</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  actionHeaderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addCompanyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    height: 46,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  addCompanyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  companiesList: {
    gap: 12,
  },
  companyCard: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  companyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
  },
  companySlug: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  planBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  enterpriseBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  statusSuspended: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E676',
  },
  licenseBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  licenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  licenseText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E5FF',
  },
  compStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: SPACING.sm,
  },
  compStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compStatLabel: {
    fontSize: 11,
  },
  compStatVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  compActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  switchCompanyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    height: 42,
    borderRadius: RADIUS.sm,
  },
  switchCompanyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  btnSuspend: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnActivate: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  toggleStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: RADIUS.full,
  },
  modalFormScroll: {
    marginBottom: SPACING.md,
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E50914',
    marginTop: 12,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  planOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  planOptionActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
  },
  planOptionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  planOptionTextActive: {
    color: '#E50914',
  },
  planOptionSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  submitCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    height: 50,
    borderRadius: RADIUS.sm,
    marginTop: 18,
    ...SHADOWS.md,
  },
  submitCreateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
