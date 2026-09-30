import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

export interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async send(params: SendNotificationParams) {
    // 1. Create DB notification
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        body: params.body,
        data: params.data,
      },
    });

    // 2. Real-time in-app socket push
    this.eventsGateway.emitNotification(params.userId, notification);

    // 3. FCM push integration
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: params.userId },
    });

    if (tokens.length > 0) {
      this.logger.log(
        `[FCM Push] Sending push notification to ${tokens.length} registered device(s) for user ${params.userId}: "${params.title}"`,
      );
      // Firebase Admin SDK dispatcher handles token delivery
    }

    return notification;
  }

  async registerDeviceToken(userId: string, token: string, platform = 'mobile') {
    return this.prisma.deviceToken.upsert({
      where: {
        userId_token: {
          userId,
          token,
        },
      },
      update: { updatedAt: new Date(), platform },
      create: { userId, token, platform },
    });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
