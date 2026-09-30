import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { api } from '../../../src/services/api';
import { COLORS, RADIUS, SPACING } from '../../../src/constants/theme';
import { ArrowLeft, MapPin, Store, User, Box, Banknote } from 'lucide-react-native';

export default function CreateOrderScreen() {
  const router = useRouter();
  const { t } = useSettingsStore();

  const [pickupName, setPickupName] = useState('Burger Hub Cairo');
  const [pickupPhone, setPickupPhone] = useState('+201099887701');
  const [pickupAddress, setPickupAddress] = useState('City Stars Mall, Heliopolis, Cairo');
  const [pickupLat, setPickupLat] = useState('30.0734');
  const [pickupLng, setPickupLng] = useState('31.3468');

  const [customerName, setCustomerName] = useState('Hassan Mahmoud');
  const [customerPhone, setCustomerPhone] = useState('+201155443322');
  const [deliveryAddress, setDeliveryAddress] = useState('14 Abbas El Akkad, Nasr City, Cairo');
  const [deliveryLat, setDeliveryLat] = useState('30.0571');
  const [deliveryLng, setDeliveryLng] = useState('31.3418');

  const [packageDescription, setPackageDescription] = useState('Double Burger Combo + Shake');
  const [packageType, setPackageType] = useState('FOOD');
  const [deliveryFee, setDeliveryFee] = useState('45');
  const [codAmount, setCodAmount] = useState('280');
  const [notes, setNotes] = useState('Please handle bag carefully');
  const [priority, setPriority] = useState('HIGH');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!pickupName || !customerName || !customerPhone || !deliveryAddress) {
      Alert.alert(t.error, 'Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        pickupName,
        pickupPhone,
        pickupAddress,
        pickupLatitude: parseFloat(pickupLat) || 30.0734,
        pickupLongitude: parseFloat(pickupLng) || 31.3468,
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryLatitude: parseFloat(deliveryLat) || 30.0571,
        deliveryLongitude: parseFloat(deliveryLng) || 31.3418,
        packageDescription,
        packageType,
        deliveryFee: parseFloat(deliveryFee) || 45,
        codAmount: parseFloat(codAmount) || 0,
        paymentMethod: parseFloat(codAmount) > 0 ? 'COD' : 'CASH',
        priority,
        notes,
      };

      const res = await api.post('/orders', payload);
      Alert.alert('✅ Order Created', `Order ${res.data.orderNumber} successfully registered!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(t.error, err.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>CREATE DELIVERY ORDER</Text>
        </View>

        {/* Pickup Details Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeading}>
            <Store size={18} color={COLORS.info} />
            <Text style={styles.cardTitle}>PICKUP LOCATION (STORE)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Store / Merchant Name *"
            placeholderTextColor={COLORS.textMuted}
            value={pickupName}
            onChangeText={setPickupName}
          />
          <TextInput
            style={styles.input}
            placeholder="Store Phone *"
            placeholderTextColor={COLORS.textMuted}
            value={pickupPhone}
            onChangeText={setPickupPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Store Full Address *"
            placeholderTextColor={COLORS.textMuted}
            value={pickupAddress}
            onChangeText={setPickupAddress}
          />
        </Card>

        {/* Customer & Dropoff Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeading}>
            <User size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>DELIVERY RECIPIENT (CUSTOMER)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Customer Name *"
            placeholderTextColor={COLORS.textMuted}
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Customer Phone *"
            placeholderTextColor={COLORS.textMuted}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Customer Delivery Address *"
            placeholderTextColor={COLORS.textMuted}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />
        </Card>

        {/* Package & Payment Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeading}>
            <Box size={18} color={COLORS.goldAccent} />
            <Text style={styles.cardTitle}>PACKAGE & PAYMENT</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Package Description *"
            placeholderTextColor={COLORS.textMuted}
            value={packageDescription}
            onChangeText={setPackageDescription}
          />
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>COD to Collect (EGP)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                value={codAmount}
                onChangeText={setCodAmount}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Delivery Fee (EGP)</Text>
              <TextInput
                style={styles.input}
                placeholder="40"
                placeholderTextColor={COLORS.textMuted}
                value={deliveryFee}
                onChangeText={setDeliveryFee}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Instructions / Notes (Optional)"
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Button
          title="DISPATCH ORDER"
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backBtn: {
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    gap: 10,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    color: COLORS.white,
    fontSize: 14,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
});
