import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { User, Phone, Mail, Bike, Globe, LogOut } from 'lucide-react-native';

export default function CourierProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useSettingsStore();

  const handleLogout = async () => {
    Alert.alert(t.logout, 'Are you sure you want to sign out?', [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t.tabProfile}</Text>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={32} color={COLORS.white} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.roleBadge}>COURIER FLEET</Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Phone size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{user?.phone}</Text>
          </View>
          {user?.email && (
            <View style={styles.infoRow}>
              <Mail size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>{user?.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Bike size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {user?.vehicleType || 'MOTORCYCLE'} {user?.plateNumber ? `(${user.plateNumber})` : ''}
            </Text>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <View style={styles.settingLabelGroup}>
              <Globe size={18} color={COLORS.info} />
              <Text style={styles.settingLabel}>{t.language}</Text>
            </View>
            <Text style={styles.settingValue}>
              {language === 'ar' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title={t.logout}
          onPress={handleLogout}
          variant="danger"
          size="lg"
          icon={<LogOut size={18} color={COLORS.white} />}
          style={styles.logoutBtn}
        />
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  roleBadge: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  detailsCard: {
    padding: SPACING.md,
    gap: 14,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  settingValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
});
