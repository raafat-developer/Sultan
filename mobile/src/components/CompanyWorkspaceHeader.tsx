import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { Building2, Check, ChevronDown, ShieldCheck, Sparkles, X } from 'lucide-react-native';

export interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  plan: 'ENTERPRISE' | 'PRO' | 'STARTER';
  licenseKey: string;
  hub: string;
  brandColor: string;
  activeCouriers: number;
}

export const DEMO_COMPANIES: CompanyInfo[] = [
  {
    id: 'cmp-fastman-001',
    name: 'FAST MAN Express',
    slug: 'fastman',
    plan: 'ENTERPRISE',
    licenseKey: 'FM-LIC-2026-99A1-88FE',
    hub: 'Cairo Downtown Central Hub #01',
    brandColor: '#E50914',
    activeCouriers: 18,
  },
  {
    id: 'cmp-alburaq-002',
    name: 'Al-Buraq Logistics',
    slug: 'alburaq',
    plan: 'PRO',
    licenseKey: 'BRQ-LIC-2026-44B2-11CD',
    hub: 'Giza & 6th October Fleet Hub #02',
    brandColor: '#00E5FF',
    activeCouriers: 12,
  },
  {
    id: 'cmp-speedy-003',
    name: 'Speedy Cairo Delivery',
    slug: 'speedy',
    plan: 'STARTER',
    licenseKey: 'SPD-LIC-2026-88C3-22AB',
    hub: 'Nasr City & Heliopolis Hub #03',
    brandColor: '#FBBF24',
    activeCouriers: 5,
  },
];

interface Props {
  onCompanyChange?: (company: CompanyInfo) => void;
  compact?: boolean;
}

export const CompanyWorkspaceHeader: React.FC<Props> = ({ onCompanyChange, compact = false }) => {
  const { colors, language } = useSettingsStore();
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo>(DEMO_COMPANIES[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const selectCompany = (company: CompanyInfo) => {
    setSelectedCompany(company);
    setModalVisible(false);
    if (onCompanyChange) onCompanyChange(company);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
          compact && styles.containerCompact,
        ]}
      >
        <View style={styles.leftRow}>
          <View
            style={[
              styles.companyIconBox,
              { backgroundColor: `${selectedCompany.brandColor}20` },
            ]}
          >
            <Building2 size={16} color={selectedCompany.brandColor} />
          </View>
          <View style={styles.textCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
                {selectedCompany.name}
              </Text>
              <View
                style={[
                  styles.planBadge,
                  { backgroundColor: `${selectedCompany.brandColor}25` },
                ]}
              >
                <Text style={[styles.planBadgeText, { color: selectedCompany.brandColor }]}>
                  {selectedCompany.plan}
                </Text>
              </View>
            </View>
            {!compact && (
              <View style={styles.subRow}>
                <ShieldCheck size={11} color={colors.success} />
                <Text style={[styles.subText, { color: colors.textMuted }]} numberOfLines={1}>
                  {selectedCompany.hub} • {selectedCompany.activeCouriers} {language === 'ar' ? 'مندوب نشط' : 'active couriers'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.switchButton}>
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {language === 'ar' ? 'تبديل الشركة' : 'Switch'}
          </Text>
          <ChevronDown size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Company Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === 'ar' ? 'اختيار شركة الشحن (B2B SaaS)' : 'Select Client Company (Multi-Tenant)'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {language === 'ar'
                ? 'يتيح لك النظام كمطور عزل وتشغيل أسطول كل شركة بشكل مستقل تماماً مع ترخيص تشفير خاص بها.'
                : 'Switch tenant workspace to view isolated couriers, fleet metrics, and orders.'}
            </Text>

            <FlatList
              data={DEMO_COMPANIES}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10, marginTop: 12 }}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedCompany.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => selectCompany(item)}
                    style={[
                      styles.companyItem,
                      {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.itemIconCircle, { backgroundColor: `${item.brandColor}20` }]}>
                      <Building2 size={20} color={item.brandColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.itemPlanBadge, { color: item.brandColor }]}>
                          {item.plan}
                        </Text>
                      </View>
                      <Text style={[styles.itemHub, { color: colors.textMuted }]}>{item.hub}</Text>
                      <Text style={[styles.itemLicense, { color: colors.textSecondary }]}>
                        🔑 {item.licenseKey}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  containerCompact: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  companyIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 1,
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subText: {
    fontSize: 11,
    fontWeight: '500',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    gap: 12,
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemPlanBadge: {
    fontSize: 10,
    fontWeight: '900',
  },
  itemHub: {
    fontSize: 11,
    marginTop: 2,
  },
  itemLicense: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 3,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
