import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FastManLogo } from '../../src/components/FastManLogo';
import { Button } from '../../src/components/Button';
import { LanguageToggle } from '../../src/components/LanguageToggle';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { Bike, ShieldCheck, Phone, Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t, isRTL, colors } = useSettingsStore();

  const [mode, setMode] = useState<'courier' | 'staff'>('courier');
  const [phone, setPhone] = useState('+201000000011');
  const [email, setEmail] = useState('admin@fastman.com');
  const [password, setPassword] = useState('Courier123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (mode === 'courier') {
        const res = await api.post('/auth/courier/login', {
          phone: phone.trim(),
          password,
        });
        await setAuth(res.data);
        router.replace('/(courier)/home');
      } else {
        const res = await api.post('/auth/admin/login', {
          email: email.trim(),
          password,
        });
        await setAuth(res.data);
        router.replace('/(admin)/dashboard');
      }
    } catch (err: any) {
      const message = err.message || t.error;
      setErrorMsg(message);
      Alert.alert(t.error, message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCourierDemo = (index: number) => {
    setMode('courier');
    setPhone(`+20100000001${index}`);
    setPassword('Courier123!');
    setErrorMsg(null);
  };

  const fillAdminDemo = (role: 'admin' | 'dispatcher' | 'superadmin') => {
    setMode('staff');
    if (role === 'admin') setEmail('admin@fastman.com');
    if (role === 'dispatcher') setEmail('dispatcher@fastman.com');
    if (role === 'superadmin') setEmail('superadmin@fastman.com');
    setPassword('Password123!');
    setErrorMsg(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.customerTrackPill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.primary }
              ]}
              onPress={() => router.push('/track' as any)}
              activeOpacity={0.85}
            >
              <Text style={[styles.customerTrackPillText, { color: colors.primary }]}>📦 {t.trackOrder}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemeToggle />
              <LanguageToggle />
            </View>
          </View>

          {/* Logo */}
          <View style={styles.logoSection}>
            <FastManLogo size="lg" />
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>{t.welcomeBack}</Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={[styles.modeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('courier');
                setPassword('Courier123!');
                setErrorMsg(null);
              }}
              style={[styles.modeTab, mode === 'courier' && styles.activeTab]}
            >
              <Bike size={18} color={mode === 'courier' ? '#FFFFFF' : colors.textMuted} />
              <Text
                style={[
                  styles.modeTabText,
                  { color: mode === 'courier' ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {t.courierLogin}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('staff');
                setPassword('Password123!');
                setErrorMsg(null);
              }}
              style={[styles.modeTab, mode === 'staff' && styles.activeTab]}
            >
              <ShieldCheck
                size={18}
                color={mode === 'staff' ? '#FFFFFF' : colors.textMuted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: mode === 'staff' ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                {t.staffLogin}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {mode === 'courier' ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: colors.textSecondary }]}>
                  {t.phone}
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Phone size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left', color: colors.text }]}
                    placeholder="+201000000011"
                    placeholderTextColor={colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: colors.textSecondary }]}>
                  {t.email}
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left', color: colors.text }]}
                    placeholder="admin@fastman.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left', color: colors.textSecondary }]}>
                {t.password}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? 'right' : 'left', color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <Button
              title={isLoading ? t.signingIn : t.signIn}
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            {/* Instant Demo Accounts */}
            <View style={[styles.demoSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.demoTitle, { color: colors.textMuted }]}>QUICK DEMO ACCOUNTS (1-TAP)</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={[styles.demoChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => fillCourierDemo(1)}
                >
                  <Text style={[styles.demoChipText, { color: colors.textSecondary }]}>🛵 Ahmed (Available)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => fillCourierDemo(2)}
                >
                  <Text style={[styles.demoChipText, { color: colors.textSecondary }]}>🛵 Mohamed (Busy)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => fillAdminDemo('admin')}
                >
                  <Text style={[styles.demoChipText, { color: colors.textSecondary }]}>🛡️ Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => fillAdminDemo('dispatcher')}
                >
                  <Text style={[styles.demoChipText, { color: colors.textSecondary }]}>📡 Dispatcher</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  customerTrackPill: {
    backgroundColor: '#1E2638',
    borderColor: '#00E5FF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  customerTrackPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E5FF',
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  welcomeSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    color: COLORS.textMuted,
    fontWeight: '800',
    fontSize: 13,
  },
  activeTabText: {
    color: COLORS.white,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBox: {
    backgroundColor: COLORS.dangerGlow,
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.white,
    fontSize: 15,
  },
  loginBtn: {
    marginTop: SPACING.sm,
  },
  demoSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  demoTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoChip: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
});
