import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { MailData } from '~/types/mail.type';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<MailData>) {
    const { to } = job.data;
    try {
      if (!to) {
        throw new Error('Recipient email address is required');
      }
      await this.mailerService.sendMail({ ...job.data });
      this.logger.log(
        `Email sent successfully to ${to} with job ID: ${job.id}.`,
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      throw new Error(`Email sending failed: ${errorMessage}`);
    }
  }
}
