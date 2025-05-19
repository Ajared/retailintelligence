import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { trySafe } from '~/helpers/try-safe';
import { MailData } from '~/types/mail.type';
import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }
  async process(job: Job<MailData>) {
    const [error] = await trySafe(async () => {
      if (!job.data?.to || !job.data?.subject) {
        throw new Error('Job Data is required');
      }
      await this.mailerService.sendMail(job.data);
      return true;
    });

    if (error) {
      this.logger.error(
        `Failed to send email to ${job.data?.to}: ${error.message}`,
      );
      throw error;
    }

    this.logger.log(
      `Email sent successfully to ${job.data?.to} with job ID: ${job.id}.`,
    );
  }
}
