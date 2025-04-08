import { Queue } from 'bullmq';
import { MailData } from '~/types/mail.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async sendMail(mailData: MailData) {
    try {
      const currentYear = new Date().getFullYear();
      const mailDataWithYear = {
        ...mailData,
        context: {
          ...mailData.context,
          currentYear,
        },
      };
      await this.mailQueue.add('send-mail', mailDataWithYear);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Failed to add email job to queue for ${mailData.to}`,
        err.stack,
      );
      throw new Error(`Email queueing failed: ${err.message}`);
    }
  }
}
