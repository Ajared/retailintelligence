import { Queue, Job } from 'bullmq';
import { trySafe } from '~/helpers/try-safe';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';

export interface NotificationJobData {
  userId: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification')
    private readonly notificationQueue: Queue<NotificationJobData>,
  ) {}

  async notifyNewUserSignup(userId: string) {
    let job: Job<NotificationJobData> | undefined;

    const [error] = await trySafe(async () => {
      job = await this.notificationQueue.add('notify-new-signup', {
        userId,
      });
      return job;
    });

    if (error) {
      this.logger.error(
        `Failed to add notification job to queue for user ${userId}`,
        error.message,
      );
      return false;
    }

    this.logger.log(
      `Notification job added to queue for user ${userId} with job ID: ${job?.id}.`,
    );
    return true;
  }
}
