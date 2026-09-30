import { PrismaClient, RoleType, CourierStatus, OrderStatus, PaymentMethod, CollectionStatus, ProofType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.FORCE_SEED) {
    console.warn('⚠️ Seeding is disabled in production environments unless FORCE_SEED is specified.');
    return;
  }

  console.log('🌱 Starting FAST MAN database seeding...');

  // 1. Roles
  const roles: RoleType[] = [
    RoleType.SUPER_ADMIN,
    RoleType.ADMIN,
    RoleType.DISPATCHER,
    RoleType.COURIER,
    RoleType.CUSTOMER,
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} operational role in FAST MAN platform`,
      },
    });
  }
  console.log('✓ Roles created or verified');

  // 2. Permissions
  const permissions = [
    { name: 'orders:create', description: 'Create new delivery orders' },
    { name: 'orders:assign', description: 'Assign or reassign delivery orders' },
    { name: 'orders:cancel', description: 'Cancel delivery orders' },
    { name: 'orders:view_all', description: 'View all orders across fleet' },
    { name: 'couriers:manage', description: 'Manage courier fleet accounts' },
    { name: 'couriers:track', description: 'Live GPS courier tracking' },
    { name: 'pricing:manage', description: 'Configure pricing rules and commissions' },
    { name: 'reports:view', description: 'View financial and performance analytics' },
    { name: 'audit:view', description: 'Inspect audit trail and operational logs' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('✓ Permissions created or verified');

  const defaultPassword = await argon2.hash('Password123!');
  const courierPassword = await argon2.hash('Courier123!');

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.SUPER_ADMIN } });
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.ADMIN } });
  const dispatcherRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.DISPATCHER } });
  const courierRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.COURIER } });

  // 3. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+201000000001' },
    update: {},
    create: {
      name: 'Raafat SuperAdmin',
      email: 'superadmin@fastman.com',
      phone: '+201000000001',
      passwordHash: defaultPassword,
      isActive: true,
      userRoles: {
        create: { roleId: superAdminRole.id },
      },
    },
  });

  // 4. Admin
  const admin = await prisma.user.upsert({
    where: { phone: '+201000000002' },
    update: {},
    create: {
      name: 'Tarek Admin',
      email: 'admin@fastman.com',
      phone: '+201000000002',
      passwordHash: defaultPassword,
      isActive: true,
      userRoles: {
        create: { roleId: adminRole.id },
      },
    },
  });

  // 5. Dispatcher
  const dispatcher = await prisma.user.upsert({
    where: { phone: '+201000000003' },
    update: {},
    create: {
      name: 'Hassan Dispatcher',
      email: 'dispatcher@fastman.com',
      phone: '+201000000003',
      passwordHash: defaultPassword,
      isActive: true,
      userRoles: {
        create: { roleId: dispatcherRole.id },
      },
    },
  });

  // 6. Couriers (3 Couriers)
  const couriersData = [
    {
      name: 'Ahmed Mohamed',
      phone: '+201000000011',
      email: 'ahmed.courier@fastman.com',
      plateNumber: 'ق ل م 123',
      status: CourierStatus.AVAILABLE,
      lat: 30.0444,
      lng: 31.2357, // Downtown Cairo
    },
    {
      name: 'Mohamed Taha',
      phone: '+201000000012',
      email: 'mohamed.courier@fastman.com',
      plateNumber: 'س ع د 456',
      status: CourierStatus.BUSY,
      lat: 30.0626,
      lng: 31.3364, // Nasr City
    },
    {
      name: 'Mostafa Ali',
      phone: '+201000000013',
      email: 'mostafa.courier@fastman.com',
      plateNumber: 'ن ص ر 789',
      status: CourierStatus.OFFLINE,
      lat: 29.9602,
      lng: 31.2569, // Maadi
    },
  ];

  const createdCouriers = [];
  for (const cData of couriersData) {
    const user = await prisma.user.upsert({
      where: { phone: cData.phone },
      update: {},
      create: {
        name: cData.name,
        email: cData.email,
        phone: cData.phone,
        passwordHash: courierPassword,
        isActive: true,
        userRoles: {
          create: { roleId: courierRole.id },
        },
      },
    });

    const courier = await prisma.courier.upsert({
      where: { userId: user.id },
      update: {
        status: cData.status,
        currentLatitude: cData.lat,
        currentLongitude: cData.lng,
        lastLocationUpdate: new Date(),
      },
      create: {
        userId: user.id,
        vehicleType: 'MOTORCYCLE',
        plateNumber: cData.plateNumber,
        status: cData.status,
        currentLatitude: cData.lat,
        currentLongitude: cData.lng,
        lastLocationUpdate: new Date(),
        batteryLevel: 88,
      },
    });
    createdCouriers.push(courier);
  }
  console.log(`✓ 1 SuperAdmin, 1 Admin, 1 Dispatcher, ${createdCouriers.length} Couriers ready`);

  // 7. Customers (10 Customers)
  const customersData = [
    { name: 'Kareem Fahmy', phone: '+201111111001', address: '14 Abbas El Akkad St, Nasr City, Cairo', lat: 30.0571, lng: 31.3418 },
    { name: 'Sara Mahmoud', phone: '+201111111002', address: '23 Road 9, Maadi, Cairo', lat: 29.9587, lng: 31.2612 },
    { name: 'Omar Khaled', phone: '+201111111003', address: '5th Settlement, 90th North St, New Cairo', lat: 30.0275, lng: 31.4789 },
    { name: 'Nour El Din', phone: '+201111111004', address: '12 Mossadak St, Dokki, Giza', lat: 30.0384, lng: 31.2052 },
    { name: 'Youssef Mansour', phone: '+201111111005', address: '45 Geziret El Arab St, Mohandessin, Giza', lat: 30.0543, lng: 31.2011 },
    { name: 'Layla Hassan', phone: '+201111111006', address: '8 Baghdad St, Korba, Heliopolis, Cairo', lat: 30.0894, lng: 31.3283 },
    { name: 'Ziad Ibrahim', phone: '+201111111007', address: '17 Brazil St, Zamalek, Cairo', lat: 30.0612, lng: 31.2198 },
    { name: 'Heba Adel', phone: '+201111111008', address: 'Al Hosary Square, 6th of October City', lat: 29.9723, lng: 30.9421 },
    { name: 'Mahmoud Saeed', phone: '+201111111009', address: 'Talaat Harb St, Downtown, Cairo', lat: 30.0488, lng: 31.2394 },
    { name: 'Dina Reda', phone: '+201111111010', address: 'City Gate, Al Rehab City, New Cairo', lat: 30.0631, lng: 31.4921 },
  ];

  const createdCustomers = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.upsert({
      where: { phone: cust.phone },
      update: {},
      create: {
        name: cust.name,
        phone: cust.phone,
        email: `${cust.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        addresses: {
          create: {
            label: 'Home',
            address: cust.address,
            latitude: cust.lat,
            longitude: cust.lng,
            isDefault: true,
          },
        },
      },
    });
    createdCustomers.push(customer);
  }
  console.log(`✓ ${createdCustomers.length} Customers ready`);

  // 8. Pricing Rules
  const pricingRules = [
    { name: 'Tier 1 (0–5 km)', minDistanceKm: 0, maxDistanceKm: 5, basePrice: 40, courierCutPercentage: 75 },
    { name: 'Tier 2 (5–10 km)', minDistanceKm: 5, maxDistanceKm: 10, basePrice: 60, courierCutPercentage: 70 },
    { name: 'Tier 3 (10–15 km)', minDistanceKm: 10, maxDistanceKm: 15, basePrice: 80, courierCutPercentage: 70 },
    { name: 'Tier 4 (15–25 km)', minDistanceKm: 15, maxDistanceKm: 25, basePrice: 120, courierCutPercentage: 65 },
  ];

  for (const rule of pricingRules) {
    const existing = await prisma.pricingRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.pricingRule.create({ data: rule });
    }
  }
  console.log('✓ Pricing rules initialized');

  // 9. App Settings
  const settings = [
    { key: 'auto_assign_enabled', value: true, description: 'Enable automatic courier assignment based on GPS and workload' },
    { key: 'auto_assign_radius_km', value: 10, description: 'Maximum radius in KM for auto assignment search' },
    { key: 'default_currency', value: 'EGP', description: 'Platform base currency' },
    { key: 'require_otp_delivery', value: true, description: 'Mandate 4-digit customer OTP verification before completion' },
    { key: 'cod_strict_reconciliation', value: true, description: 'Require admin review for any COD discrepancy' },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✓ App Settings configured');

  // 10. Orders (20 realistic orders across varied statuses)
  const orderStatuses: OrderStatus[] = [
    OrderStatus.NEW, OrderStatus.NEW, OrderStatus.NEW,
    OrderStatus.ASSIGNED, OrderStatus.ASSIGNED, OrderStatus.ASSIGNED,
    OrderStatus.COURIER_ACCEPTED, OrderStatus.COURIER_ACCEPTED,
    OrderStatus.GOING_TO_PICKUP, OrderStatus.GOING_TO_PICKUP,
    OrderStatus.ARRIVED_AT_PICKUP, OrderStatus.ARRIVED_AT_PICKUP,
    OrderStatus.PICKED_UP, OrderStatus.PICKED_UP,
    OrderStatus.OUT_FOR_DELIVERY, OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.ARRIVED_AT_CUSTOMER,
    OrderStatus.DELIVERED, OrderStatus.DELIVERED,
  ];

  const packages = [
    { desc: 'Electronics - Smartwatch & Earbuds', fee: 45, cod: 850, type: 'FRAGILE', weight: 0.8 },
    { desc: 'Documents - Contract Dossier', fee: 40, cod: 0, type: 'DOCUMENT', weight: 0.2 },
    { desc: 'Restaurant Food - Gourmet Burger & Wings', fee: 40, cod: 420, type: 'FOOD', weight: 1.5 },
    { desc: 'Fashion - Designer Jacket', fee: 60, cod: 1200, type: 'STANDARD', weight: 1.2 },
    { desc: 'Pharmacy - Prescription Medication', fee: 40, cod: 230, type: 'MEDICAL', weight: 0.4 },
    { desc: 'Cosmetics - Perfume & Skincare Gift Box', fee: 55, cod: 980, type: 'FRAGILE', weight: 1.1 },
    { desc: 'Auto Parts - Motorcycle Brake Pads', fee: 50, cod: 640, type: 'STANDARD', weight: 2.0 },
    { desc: 'Books - Medical Textbooks', fee: 45, cod: 350, type: 'STANDARD', weight: 2.5 },
    { desc: 'Coffee Beans & Artisan Syrup', fee: 40, cod: 510, type: 'FOOD', weight: 1.0 },
    { desc: 'Flowers & Chocolate Box', fee: 65, cod: 750, type: 'FRAGILE', weight: 1.8 },
  ];

  const merchantPickups = [
    { name: 'Zaatar W Zeit Bakery', phone: '+201099887701', address: 'City Stars Mall, Heliopolis', lat: 30.0734, lng: 31.3468 },
    { name: 'iStore Electronics Hub', phone: '+201099887702', address: 'Trivium Mall, New Cairo', lat: 30.0354, lng: 31.4721 },
    { name: 'Seif Pharmacy Flagship', phone: '+201099887703', address: 'Shehab St, Mohandessin', lat: 30.0512, lng: 31.2034 },
    { name: 'Zara Logistics Store', phone: '+201099887704', address: 'Mall of Arabia, 6th October', lat: 30.0076, lng: 30.9731 },
    { name: 'Gourmet Market', phone: '+201099887705', address: 'Degla, Maadi', lat: 29.9614, lng: 31.2721 },
  ];

  for (let i = 0; i < 20; i++) {
    const orderNum = `FM-2026-${String(i + 1).padStart(6, '0')}`;
    const token = `trk_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const status = orderStatuses[i];
    const customer = createdCustomers[i % createdCustomers.length];
    const merchant = merchantPickups[i % merchantPickups.length];
    const pkg = packages[i % packages.length];

    // Assign courier for active / in-progress / delivered orders
    const needsCourier = status !== OrderStatus.NEW;
    const assignedCourier = needsCourier ? createdCouriers[i % 2] : null; // alternate courier 1 & 2

    const otpCode = String(1000 + ((i * 37) % 9000));
    const hashedOtp = await argon2.hash(otpCode);

    const order = await prisma.order.upsert({
      where: { orderNumber: orderNum },
      update: {},
      create: {
        orderNumber: orderNum,
        trackingToken: token,
        customerId: customer.id,
        pickupName: merchant.name,
        pickupPhone: merchant.phone,
        pickupAddress: merchant.address,
        pickupLatitude: merchant.lat,
        pickupLongitude: merchant.lng,
        deliveryAddress: customersData[i % customersData.length].address,
        deliveryLatitude: customersData[i % customersData.length].lat,
        deliveryLongitude: customersData[i % customersData.length].lng,
        packageDescription: pkg.desc,
        packageType: pkg.type,
        packageWeight: pkg.weight,
        deliveryFee: pkg.fee,
        codAmount: pkg.cod,
        paymentMethod: pkg.cod > 0 ? PaymentMethod.COD : PaymentMethod.CASH,
        priority: i % 5 === 0 ? 'URGENT' : i % 3 === 0 ? 'HIGH' : 'NORMAL',
        status: status,
        notes: i % 4 === 0 ? 'Please call customer before arriving at gate.' : undefined,
        dispatcherId: dispatcher.id,
        courierId: assignedCourier?.id,
        assignedAt: needsCourier ? new Date(Date.now() - 3600000 * 3) : null,
        acceptedAt: ([
          OrderStatus.COURIER_ACCEPTED, OrderStatus.GOING_TO_PICKUP, OrderStatus.ARRIVED_AT_PICKUP,
          OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.DELIVERED
        ] as OrderStatus[]).includes(status) ? new Date(Date.now() - 3600000 * 2.5) : null,
        pickedUpAt: ([
          OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.DELIVERED
        ] as OrderStatus[]).includes(status) ? new Date(Date.now() - 3600000 * 1.5) : null,
        deliveredAt: status === OrderStatus.DELIVERED ? new Date() : null,
      },
    });

    // Create OTP
    await prisma.deliveryOtp.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        otpHash: hashedOtp,
        plainOtpForDev: otpCode,
        isVerified: status === OrderStatus.DELIVERED,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: OrderStatus.NEW,
        changedById: dispatcher.id,
        reason: 'Order created in FAST MAN platform',
      },
    });

    if (needsCourier && assignedCourier) {
      await prisma.orderAssignment.create({
        data: {
          orderId: order.id,
          courierId: assignedCourier.id,
          assignedById: dispatcher.id,
          assignedAt: new Date(Date.now() - 3600000 * 3),
          acceptedAt: new Date(Date.now() - 3600000 * 2.5),
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.NEW,
          toStatus: OrderStatus.ASSIGNED,
          changedById: dispatcher.id,
          reason: 'Assigned to courier',
        },
      });

      if (status === OrderStatus.DELIVERED) {
        await prisma.cashCollection.upsert({
          where: { orderId: order.id },
          update: {},
          create: {
            orderId: order.id,
            courierId: assignedCourier.id,
            expectedAmount: pkg.cod,
            collectedAmount: pkg.cod,
            difference: 0,
            status: CollectionStatus.RECONCILED,
            reconciledById: admin.id,
            reconciledAt: new Date(),
          },
        });

        await prisma.courierEarning.upsert({
          where: { orderId: order.id },
          update: {},
          create: {
            orderId: order.id,
            courierId: assignedCourier.id,
            baseFee: 35,
            distanceFee: 15,
            bonus: 10,
            totalEarning: 60,
            isSettled: false,
          },
        });

        await prisma.deliveryProof.create({
          data: {
            orderId: order.id,
            type: ProofType.OTP,
            notes: `Verified successfully via customer OTP: ${otpCode}`,
            uploadedById: assignedCourier.userId,
          },
        });
      }
    }
  }
  console.log('✓ 20 realistic orders initialized with status histories, OTPs, and assignments');

  // Audit initial seed
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_SEEDED',
      entityType: 'DATABASE',
      details: { environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() },
    },
  });

  console.log('🚀 FAST MAN database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
