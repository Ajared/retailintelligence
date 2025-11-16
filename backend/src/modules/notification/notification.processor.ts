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
        return;
      }

      if (user.status !== UserStatus.UNVERIFIED) {
        this.logger.log(
          `User ${userId} is already verified, skipping notification`,
        );
        return;
      }

      const unverifiedUsers =
        await this.userService.getUnverifiedUsersInLast24Hours();
      const count = unverifiedUsers.length;

      const admins = await this.userService.getAdmins();

      if (admins.length === 0) {
        this.logger.warn('No admins found, skipping notification');
        return;
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      if (count <= 3) {
        await this.sendIndividualNotification(user, admins, frontendUrl);
      } else {
        const countAfterInitialThree = count - 3;
        if (countAfterInitialThree % 5 === 0) {
          const lastFiveUsers = unverifiedUsers.slice(-5);
          await this.sendBulkNotification(lastFiveUsers, admins, frontendUrl);
        } else {
          this.logger.log(
            `Skipping notification: ${count} signups (need ${3 + Math.ceil(countAfterInitialThree / 5) * 5} for next bulk)`,
          );
        }
      }
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
    frontendUrl?: string,
  ) {
    const approvalUrl = `${frontendUrl}/admin/approve?userId=${user.id}`;
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

    await Promise.all(emailPromises);
    this.logger.log(
      `Sent individual approval notification for user ${user.id} to ${admins.length} admin(s)`,
    );
  }

  private async sendBulkNotification(
    users: { id: string; email: string }[],
    admins: { email: string }[],
    frontendUrl?: string,
  ) {
    const userIds = users.map((u) => u.id).join(',');
    const approvalUrl = `${frontendUrl}/admin/approve?userIds=${userIds}`;
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

    await Promise.all(emailPromises);
    this.logger.log(
      `Sent bulk approval notification for ${users.length} users to ${admins.length} admin(s)`,
    );
  }
}
