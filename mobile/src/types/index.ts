export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'DISPATCHER' | 'COURIER' | 'CUSTOMER';

export type CourierStatus = 'OFFLINE' | 'AVAILABLE' | 'BUSY';

export type OrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'COURIER_ACCEPTED'
  | 'GOING_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVED_AT_CUSTOMER'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNING'
  | 'RETURNED';

export type PaymentMethod = 'CASH' | 'COD' | 'CARD' | 'WALLET';

export type CollectionStatus = 'PENDING' | 'RECONCILED' | 'DISCREPANCY';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roles: RoleType[];
  courierId?: string;
  courierStatus?: CourierStatus;
  vehicleType?: string;
  plateNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Courier {
  id: string;
  userId: string;
  vehicleType: string;
  plateNumber?: string;
  status: CourierStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  batteryLevel?: number;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingToken: string;
  customerId: string;
  customer: Customer;
  pickupName: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  packageDescription: string;
  packageType: string;
  packageWeight?: number;
  deliveryFee: number;
  codAmount: number;
  paymentMethod: PaymentMethod;
  priority: string;
  status: OrderStatus;
  notes?: string;
  courierId?: string;
  courier?: Courier;
  dispatcherId?: string;
  createdAt: string;
  assignedAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  outForDeliveryAt?: string;
  arrivedAtCustomerAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  deliveryOtp?: {
    plainOtpForDev?: string;
    isVerified: boolean;
    attempts: number;
  };
  cashCollection?: {
    expectedAmount: number;
    collectedAmount: number;
    difference: number;
    status: CollectionStatus;
  };
  earning?: {
    totalEarning: number;
  };
}

export interface CourierStats {
  status: CourierStatus;
  todayOrders: number;
  completedToday: number;
  pendingToday: number;
  todayEarnings: number;
  currentDelivery?: Order | null;
}
