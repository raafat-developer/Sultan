import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Common
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { StorageModule } from './common/storage/storage.module';

// Core Business Modules
import { EventsModule } from './events/events.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { CouriersModule } from './couriers/couriers.module';
import { CustomersModule } from './customers/customers.module';
import { TrackingModule } from './tracking/tracking.module';
import { PaymentsModule } from './payments/payments.module';
import { EarningsModule } from './earnings/earnings.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    RedisModule,
    StorageModule,
    EventsModule,
    AuditModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    CouriersModule,
    CustomersModule,
    TrackingModule,
    PaymentsModule,
    EarningsModule,
    ReportsModule,
    SettingsModule,
    NotificationsModule,
    HealthModule,
    CompaniesModule,
  ],
})
export class AppModule {}
