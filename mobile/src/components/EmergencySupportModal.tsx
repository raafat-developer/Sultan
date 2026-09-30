import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import {
  AlertTriangle,
  Wrench,
  ShieldAlert,
  PhoneOff,
  MapPinOff,
  PhoneCall,
  X,
  Check,
} from 'lucide-react-native';

interface EmergencySupportModalProps {
  visible: boolean;
  onClose: () => void;
  orderNumber?: string;
}

export function EmergencySupportModal({
  visible,
  onClose,
  orderNumber,
}: EmergencySupportModalProps) {
  const { t } = useSettingsStore();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [sentAlert, setSentAlert] = useState(false);

  const incidents = [
    {
      id: 'breakdown',
      title: t.breakdownFlatTire,
      desc: 'إرسال ونش إنقاذ أو دراجة بديلة لنقل الشحنة فوراً',
      icon: Wrench,
      color: '#F59E0B',
    },
    {
      id: 'accident',
      title: t.roadAccident,
      desc: 'إشعار طوارئ عاجل للمشرف وتحديد موقعك بدقة',
      icon: ShieldAlert,
      color: '#EF4444',
    },
    {
      id: 'unreachable',
      title: t.customerUnreachable,
      desc: 'تم الاتصال بالعميل أكثر من 3 مرات بدون إجابة',
      icon: PhoneOff,
      color: '#3B82F6',
    },
    {
      id: 'wrong_address',
      title: t.wrongAddressReport,
      desc: 'العنوان الفعلي غير مطابق للموقع المسجل',
      icon: MapPinOff,
      color: '#A855F7',
    },
  ];

  const handleSendReport = () => {
    if (!selectedIncident) return;
    setSentAlert(true);
    setTimeout(() => {
      Alert.alert('✅ تم إرسال الإشعار', t.dispatchAlertSent);
      setSentAlert(false);
      setSelectedIncident(null);
      onClose();
    }, 1200);
  };

  const handleCallDispatcher = () => {
    Linking.openURL('tel:+201000000002');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AlertTriangle size={22} color="#EF4444" />
              <Text style={styles.title}>{t.emergencySupport}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            اختر نوع المشكلة لإرسال بلاغ فوري لغرفة العمليات مع إحداثياتك الحالية
          </Text>

          {/* Incidents List */}
          <View style={styles.list}>
            {incidents.map((inc) => {
              const IconComp = inc.icon;
              const isSelected = selectedIncident === inc.id;
              return (
                <TouchableOpacity
                  key={inc.id}
                  style={[
                    styles.incidentCard,
                    isSelected && { borderColor: inc.color, backgroundColor: `${inc.color}15` },
                  ]}
                  onPress={() => setSelectedIncident(inc.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: `${inc.color}20` }]}>
                    <IconComp size={20} color={inc.color} />
                  </View>
                  <View style={styles.incidentInfo}>
                    <Text style={styles.incidentTitle}>{inc.title}</Text>
                    <Text style={styles.incidentDesc}>{inc.desc}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: inc.color }]}>
                      <Check size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.callDispatcherBtn}
              onPress={handleCallDispatcher}
              activeOpacity={0.8}
            >
              <PhoneCall size={18} color="#FFFFFF" />
              <Text style={styles.callDispatcherText}>اتصال بالمشرف</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendAlertBtn,
                !selectedIncident && styles.sendAlertBtnDisabled,
              ]}
              disabled={!selectedIncident || sentAlert}
              onPress={handleSendReport}
              activeOpacity={0.85}
            >
              <Text style={styles.sendAlertText}>
                {sentAlert ? 'جاري الإرسال...' : 'إرسال البلاغ'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121622',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#1E2638',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EF4444',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1E2638',
    borderRadius: RADIUS.full,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  list: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  incidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F131D',
    borderWidth: 1,
    borderColor: '#1E2638',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  incidentDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callDispatcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2638',
    height: 48,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  callDispatcherText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sendAlertBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    height: 48,
    borderRadius: RADIUS.sm,
  },
  sendAlertBtnDisabled: {
    opacity: 0.4,
  },
  sendAlertText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
