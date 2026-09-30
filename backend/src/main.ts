import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('FastManServer');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global Prefix (excluding health probe)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'uploads/(.*)'],
  });

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['*'];

  app.enableCors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Filter & Interceptor
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Serve static uploads
  const uploadPath = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FAST MAN - Delivery Management Platform API')
    .setDescription(
      'Commercial Production REST API for FAST MAN motorcycle delivery fleet.\n' +
      'Supports Couriers, Dispatchers, Admins, Real-time GPS Tracking, Orders State Machine, OTP Verification, and COD Reconciliation.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'JWT token generation, courier phone login, admin email login, and refresh tokens')
    .addTag('Orders', 'Order placement, human-readable numbers, assignment, lifecycle state machine, and delivery OTP')
    .addTag('Couriers', 'Courier fleet management, status availability toggle, and telemetry location reporting')
    .addTag('Customers', 'Customer records, delivery addresses, and customer ordering statistics')
    .addTag('Tracking', 'Public secure customer tracking and real-time live dispatcher fleet map')
    .addTag('Payments & COD', 'Cash on Delivery tracking, difference reporting, and reconciliation')
    .addTag('Earnings', 'Courier payout breakdown, delivery commissions, and settlement')
    .addTag('Reports & Analytics', 'Daily, weekly, and monthly KPIs (Total orders, delivered, revenue, fees, earnings)')
    .addTag('Settings & Pricing', 'Dynamic distance pricing tiers and operational system settings')
    .addTag('Notifications', 'Push notification tokens and in-app realtime alerts')
    .addTag('Audit Logs', 'Immutable audit trail of critical operational actions')
    .addTag('Health Check', 'Uptime and database connectivity health probe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'FAST MAN API Documentation',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 FAST MAN Backend is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger API Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`🩺 Health check available at: http://localhost:${port}/health`);
}

bootstrap();
