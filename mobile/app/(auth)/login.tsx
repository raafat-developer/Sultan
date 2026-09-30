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
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { api } from '../../src/services/api';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';
import { Bike, ShieldCheck, Phone, Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t, isRTL } = useSettingsStore();

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
    <SafeAreaView style={styles.safeArea}>
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
            <LanguageToggle />
          </View>

          {/* Logo */}
          <View style={styles.logoSection}>
            <FastManLogo size="lg" />
            <Text style={styles.welcomeSubtitle}>{t.welcomeBack}</Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('courier');
                setPassword('Courier123!');
                setErrorMsg(null);
              }}
              style={[styles.modeTab, mode === 'courier' && styles.activeTab]}
            >
              <Bike size={18} color={mode === 'courier' ? COLORS.white : COLORS.textMuted} />
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'courier' && styles.activeTabText,
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
                color={mode === 'staff' ? COLORS.white : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'staff' && styles.activeTabText,
                ]}
              >
                {t.staffLogin}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {mode === 'courier' ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t.phone}
                </Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder="+201000000011"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t.email}
                </Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder="admin@fastman.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t.password}
              </Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
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
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>QUICK DEMO ACCOUNTS (1-TAP)</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillCourierDemo(1)}
                >
                  <Text style={styles.demoChipText}>🛵 Ahmed (Available)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillCourierDemo(2)}
                >
                  <Text style={styles.demoChipText}>🛵 Mohamed (Busy)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillAdminDemo('admin')}
                >
                  <Text style={styles.demoChipText}>🛡️ Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillAdminDemo('dispatcher')}
                >
                  <Text style={styles.demoChipText}>📡 Dispatcher</Text>
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
    justifyContent: 'flex-end',
    paddingVertical: SPACING.sm,
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
