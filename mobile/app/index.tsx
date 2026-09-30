import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { FastManLogo } from '../src/components/FastManLogo';
import { COLORS } from '../src/constants/theme';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (role === 'COURIER') {
      router.replace('/(courier)/home');
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DISPATCHER') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, role, isLoading]);

  return (
    <View style={styles.container}>
      <FastManLogo size="lg" />
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});
