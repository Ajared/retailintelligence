import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { trySafe } from '~/helpers/try-safe';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationJobData } from './notification.service';
import { UserStatus } from '../user/constants/user.constant';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const [error] = await trySafe(async () => {
      if (!job.data?.userId) {
        throw new Error('User ID is required');
      }

      const { userId } = job.data;

      const [userError, user] = await trySafe(() =>
        this.userService.getUserById(userId),
      );

      if (userError || !user) {
        this.logger.warn(`User ${userId} not found, skipping notification`);
        return true;
      }

      if (user.status !== UserStatus.UNVERIFIED) {
        this.logger.log(
          `User ${userId} is already verified, skipping notification`,
        );
        return true;
      }

      const unverifiedUsers =
        await this.userService.getUnverifiedUsersInLast24Hours();
      const count = unverifiedUsers.length;

      const admins = await this.userService.getAdmins();

      if (admins.length === 0) {
        this.logger.warn('No admins found, skipping notification');
        return true;
      }

      const currentUserIndex = unverifiedUsers.findIndex(
        (u) => u.id === userId,
      );

      if (
        count <=
        this.configService.get<number>('NOTIFICATION_INDIVIDUAL_THRESHOLD')!
      ) {
        if (currentUserIndex === -1) {
          this.logger.warn(
            `User ${userId} not found in unverified users list, skipping notification`,
          );
          return true;
        }
        await this.sendIndividualNotification(user, admins);
      } else {
        const countAfterInitial =
          count -
          this.configService.get<number>('NOTIFICATION_INDIVIDUAL_THRESHOLD')!;
        if (
          countAfterInitial %
            this.configService.get<number>('NOTIFICATION_BULK_THRESHOLD')! ===
          0
        ) {
          const lastBulkUsers = unverifiedUsers.slice(
            -this.configService.get<number>('NOTIFICATION_BULK_THRESHOLD')!,
          );
          const isCurrentUserInBulk = lastBulkUsers.some(
            (u) => u.id === userId,
          );

          if (isCurrentUserInBulk) {
            await this.sendBulkNotification(lastBulkUsers, admins);
          } else {
            this.logger.log(
              `Skipping bulk notification: current user ${userId} is not in the last ${this.configService.get<number>('NOTIFICATION_BULK_THRESHOLD')!} users`,
            );
            return true;
          }
        } else {
          this.logger.log(
            `Skipping notification: ${count} signups (need ${this.configService.get<number>('NOTIFICATION_INDIVIDUAL_THRESHOLD')! + Math.ceil(countAfterInitial / this.configService.get<number>('NOTIFICATION_BULK_THRESHOLD')!) * this.configService.get<number>('NOTIFICATION_BULK_THRESHOLD')!} for next bulk)`,
          );
          return true;
        }
      }

      return true;
    });

    if (error) {
      this.logger.error(
        `Failed to process notification job ${job.id}: ${error.message}`,
      );
      throw error;
    }

    this.logger.log(`Notification job ${job.id} processed successfully.`);
  }

  private async sendIndividualNotification(
    user: { id: string; email: string },
    admins: { email: string }[],
  ) {
    const approvalUrl = `${this.configService.get<string>('FRONTEND_URL')}/admin/approve?userId=${user.id}`;
    const userName = user.email.split('@')[0];

    const emailPromises = admins.map((admin) =>
      this.mailService.sendMail({
        to: admin.email,
        subject: 'New User Signup - Approval Required',
        template: 'user-approval-individual',
        context: {
          userName,
          userEmail: user.email,
          approvalUrl,
        },
      }),
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      this.logger.warn(
        `Sent individual approval notification for user ${user.id} to ${successful}/${admins.length} admin(s). ${failed} failed.`,
      );
    } else {
      this.logger.log(
        `Sent individual approval notification for user ${user.id} to ${admins.length} admin(s)`,
      );
    }
  }

  private async sendBulkNotification(
    users: { id: string; email: string }[],
    admins: { email: string }[],
  ) {
    const userIds = users.map((u) => u.id).join(',');
    const approvalUrl = `${this.configService.get<string>('FRONTEND_URL')}/admin/approve?userIds=${userIds}`;
    const userList = users.map((u) => ({
      email: u.email,
      name: u.email.split('@')[0],
    }));

    const emailPromises = admins.map((admin) =>
      this.mailService.sendMail({
        to: admin.email,
        subject: `Bulk User Approval - ${users.length} New Signups`,
        template: 'user-approval-bulk',
        context: {
          users: userList,
          userCount: users.length,
          approvalUrl,
        },
      }),
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      this.logger.warn(
        `Sent bulk approval notification for ${users.length} users to ${successful}/${admins.length} admin(s). ${failed} failed.`,
      );
    } else {
      this.logger.log(
        `Sent bulk approval notification for ${users.length} users to ${admins.length} admin(s)`,
      );
    }
  }
}
