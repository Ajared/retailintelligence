import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { Module, Logger } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: 'notification',
    }),
    MailModule,
    UserModule,
  ],
  providers: [NotificationService, NotificationProcessor, Logger],
  exports: [NotificationService],
})
export class NotificationModule {}
