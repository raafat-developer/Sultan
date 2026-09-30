import { create } from 'zustand';
import { CourierStatus, Order } from '../types';

interface CourierState {
  status: CourierStatus;
  currentDelivery: Order | null;
  lastKnownLocation: { latitude: number; longitude: number } | null;
  setStatus: (status: CourierStatus) => void;
  setCurrentDelivery: (order: Order | null) => void;
  setLastKnownLocation: (loc: { latitude: number; longitude: number }) => void;
}

export const useCourierStore = create<CourierState>((set) => ({
  status: 'OFFLINE',
  currentDelivery: null,
  lastKnownLocation: null,
  setStatus: (status) => set({ status }),
  setCurrentDelivery: (currentDelivery) => set({ currentDelivery }),
  setLastKnownLocation: (lastKnownLocation) => set({ lastKnownLocation }),
}));
