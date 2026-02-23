import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationIntegrationService } from './notification-integration.service';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';

/**
 * Notifications Module
 * Handles real-time notifications via WebSocket
 * Provides event queue for scalable notification processing
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [
    NotificationsController,
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationIntegrationService,
  ],
  exports: [
    NotificationsService,
    NotificationsGateway,
    NotificationIntegrationService,
  ],
})
export class NotificationsModule {}
