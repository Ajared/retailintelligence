import { Queue, Job } from 'bullmq';
import { trySafe } from '~/helpers/try-safe';
import { MailData } from '~/types/mail.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async sendMail(mailData: MailData) {
    let job: Job<MailData> | undefined;

    const [error] = await trySafe(async () => {
      const currentYear = new Date().getFullYear();
      const mailDataWithYear = {
        ...mailData,
        context: {
          ...mailData.context,
          currentYear,
        },
      };
      job = await this.mailQueue.add('send-mail', mailDataWithYear);
      return job;
    });

    if (error) {
      this.logger.error(
        `Failed to add email job to queue for ${mailData.to}`,
        error.message,
      );
      return false;
    }

    this.logger.log(
      `Email job added to queue for ${mailData.to} with job ID: ${job?.id}.`,
    );
  }
}
