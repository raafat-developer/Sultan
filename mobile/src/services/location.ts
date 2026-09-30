import * as Location from 'expo-location';
import { api } from './api';
import { useCourierStore } from '../store/courierStore';

let trackingInterval: NodeJS.Timeout | null = null;

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Failed to request location permissions:', err);
      return false;
    }
  },

  async startTracking(activeOrderId?: string) {
    if (trackingInterval) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Send immediately once
    await this.sendCurrentLocation(activeOrderId);

    // Then update every 20 seconds
    trackingInterval = setInterval(async () => {
      const status = useCourierStore.getState().status;
      if (status === 'OFFLINE') {
        this.stopTracking();
        return;
      }
      await this.sendCurrentLocation(activeOrderId);
    }, 20000);
  },

  async sendCurrentLocation(activeOrderId?: string) {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude, accuracy, heading, speed } = location.coords;

      useCourierStore.getState().setLastKnownLocation({ latitude, longitude });

      await api.post('/couriers/location', {
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        batteryLevel: 90,
        activeOrderId,
      });
    } catch (err) {
      // In dev simulator or offline mode, avoid crashing
    }
  },

  stopTracking() {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  },
};
