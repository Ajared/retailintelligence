import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { Module, Logger } from '@nestjs/common';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: 'mail',
    }),
  ],
  providers: [MailService, MailProcessor, Logger],
  exports: [MailService],
})
export class MailModule {}
