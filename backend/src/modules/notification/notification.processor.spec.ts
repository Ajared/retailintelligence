import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationJobData } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { UserStatus, UserRole } from '../user/constants/user.constant';

const mockMailService = {
  sendMail: jest.fn(),
};

const mockUserService = {
  getUserById: jest.fn(),
  getUnverifiedUsersInLast24Hours: jest.fn(),
  getAdmins: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let userService: UserService;
  let module: TestingModule;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockMailService.sendMail.mockClear();
    mockUserService.getUserById.mockClear();
    mockUserService.getUnverifiedUsersInLast24Hours.mockClear();
    mockUserService.getAdmins.mockClear();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    mockConfigService.get.mockReturnValue('https://example.com');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      status: UserStatus.UNVERIFIED,
    };

    const mockAdmin1 = {
      id: 'admin-1',
      email: 'admin1@example.com',
      role: UserRole.ADMIN,
    };

    const mockAdmin2 = {
      id: 'admin-2',
      email: 'admin2@example.com',
      role: UserRole.SUPER_ADMIN,
    };

    it('should throw error if userId is missing', async () => {
      const mockJob = {
        data: {},
        id: 'job-123',
      } as Job<NotificationJobData>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'User ID is required',
      );

      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should skip notification if user is not found', async () => {
      const mockJob = {
        data: { userId: 'non-existent' },
        id: 'job-123',
      } as Job<NotificationJobData>;

      mockUserService.getUserById.mockResolvedValueOnce(null);

      await processor.process(mockJob);

      expect(userService.getUserById).toHaveBeenCalledWith('non-existent');
      expect(warnSpy).toHaveBeenCalledWith(
        'User non-existent not found, skipping notification',
      );
      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });

    it('should skip notification if user is already verified', async () => {
      const mockJob = {
        data: { userId: 'user-123' },
        id: 'job-123',
      } as Job<NotificationJobData>;

      const verifiedUser = { ...mockUser, status: UserStatus.VERIFIED };
      mockUserService.getUserById.mockResolvedValueOnce(verifiedUser);

      await processor.process(mockJob);

      expect(userService.getUserById).toHaveBeenCalledWith('user-123');
      expect(logSpy).toHaveBeenCalledWith(
        'User user-123 is already verified, skipping notification',
      );
      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });

    it('should skip notification if no admins found', async () => {
      const mockJob = {
        data: { userId: 'user-123' },
        id: 'job-123',
      } as Job<NotificationJobData>;

      mockUserService.getUserById.mockResolvedValueOnce(mockUser);
      mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce([
        mockUser,
      ]);
      mockUserService.getAdmins.mockResolvedValueOnce([]);

      await processor.process(mockJob);

      expect(warnSpy).toHaveBeenCalledWith(
        'No admins found, skipping notification',
      );
      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });

    describe('Individual notifications (count <= 3)', () => {
      it('should send individual notification for first user', async () => {
        const mockJob = {
          data: { userId: 'user-123' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        mockUserService.getUserById.mockResolvedValueOnce(mockUser);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce([
          mockUser,
        ]);
        mockUserService.getAdmins.mockResolvedValueOnce([mockAdmin1]);
        mockMailService.sendMail.mockResolvedValueOnce(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);
        expect(mockMailService.sendMail).toHaveBeenCalledWith({
          to: 'admin1@example.com',
          subject: 'New User Signup - Approval Required',
          template: 'user-approval-individual',
          context: {
            userName: 'test',
            userEmail: 'test@example.com',
            approvalUrl: 'https://example.com/admin/approve?userId=user-123',
          },
        });
        expect(logSpy).toHaveBeenCalledWith(
          'Sent individual approval notification for user user-123 to 1 admin(s)',
        );
        expect(logSpy).toHaveBeenCalledWith(
          'Notification job job-123 processed successfully.',
        );
      });

      it('should send individual notification to multiple admins', async () => {
        const mockJob = {
          data: { userId: 'user-123' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        mockUserService.getUserById.mockResolvedValueOnce(mockUser);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce([
          mockUser,
        ]);
        mockUserService.getAdmins.mockResolvedValueOnce([
          mockAdmin1,
          mockAdmin2,
        ]);
        mockMailService.sendMail.mockResolvedValue(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(2);
        expect(mockMailService.sendMail).toHaveBeenCalledWith({
          to: 'admin1@example.com',
          subject: 'New User Signup - Approval Required',
          template: 'user-approval-individual',
          context: {
            userName: 'test',
            userEmail: 'test@example.com',
            approvalUrl: 'https://example.com/admin/approve?userId=user-123',
          },
        });
        expect(mockMailService.sendMail).toHaveBeenCalledWith({
          to: 'admin2@example.com',
          subject: 'New User Signup - Approval Required',
          template: 'user-approval-individual',
          context: {
            userName: 'test',
            userEmail: 'test@example.com',
            approvalUrl: 'https://example.com/admin/approve?userId=user-123',
          },
        });
        expect(logSpy).toHaveBeenCalledWith(
          'Sent individual approval notification for user user-123 to 2 admin(s)',
        );
      });

      it('should send individual notification for third user', async () => {
        const mockJob = {
          data: { userId: 'user-3' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        const user3 = {
          id: 'user-3',
          email: 'user3@example.com',
          status: UserStatus.UNVERIFIED,
        };
        mockUserService.getUserById.mockResolvedValueOnce(user3);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce([
          mockUser,
          {
            id: 'user-2',
            email: 'user2@example.com',
            status: UserStatus.UNVERIFIED,
          },
          user3,
        ]);
        mockUserService.getAdmins.mockResolvedValueOnce([mockAdmin1]);
        mockMailService.sendMail.mockResolvedValueOnce(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          'Sent individual approval notification for user user-3 to 1 admin(s)',
        );
      });
    });

    describe('Bulk notifications (count > 3)', () => {
      it('should skip notification when count is 4 (not a multiple of 5 after initial 3)', async () => {
        const mockJob = {
          data: { userId: 'user-4' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        const user4 = {
          id: 'user-4',
          email: 'user4@example.com',
          status: UserStatus.UNVERIFIED,
        };
        mockUserService.getUserById.mockResolvedValueOnce(user4);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce([
          mockUser,
          {
            id: 'user-2',
            email: 'user2@example.com',
            status: UserStatus.UNVERIFIED,
          },
          {
            id: 'user-3',
            email: 'user3@example.com',
            status: UserStatus.UNVERIFIED,
          },
          user4,
        ]);
        mockUserService.getAdmins.mockResolvedValueOnce([mockAdmin1]);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith(
          'Skipping notification: 4 signups (need 8 for next bulk)',
        );
      });

      it('should send bulk notification when count is 8 (3 + 5)', async () => {
        const mockJob = {
          data: { userId: 'user-8' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        const users = Array.from({ length: 8 }, (_, i) => ({
          id: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          status: UserStatus.UNVERIFIED,
        }));

        mockUserService.getUserById.mockResolvedValueOnce(users[7]);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce(
          users,
        );
        mockUserService.getAdmins.mockResolvedValueOnce([mockAdmin1]);
        mockMailService.sendMail.mockResolvedValueOnce(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);
        expect(mockMailService.sendMail).toHaveBeenCalledWith({
          to: 'admin1@example.com',
          subject: 'Bulk User Approval - 5 New Signups',
          template: 'user-approval-bulk',
          context: {
            users: [
              { email: 'user4@example.com', name: 'user4' },
              { email: 'user5@example.com', name: 'user5' },
              { email: 'user6@example.com', name: 'user6' },
              { email: 'user7@example.com', name: 'user7' },
              { email: 'user8@example.com', name: 'user8' },
            ],
            userCount: 5,
            approvalUrl:
              'https://example.com/admin/approve?userIds=user-4,user-5,user-6,user-7,user-8',
          },
        });
        expect(logSpy).toHaveBeenCalledWith(
          'Sent bulk approval notification for 5 users to 1 admin(s)',
        );
      });

      it('should send bulk notification when count is 13 (3 + 10)', async () => {
        const mockJob = {
          data: { userId: 'user-13' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        const users = Array.from({ length: 13 }, (_, i) => ({
          id: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          status: UserStatus.UNVERIFIED,
        }));

        mockUserService.getUserById.mockResolvedValueOnce(users[12]);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce(
          users,
        );
        mockUserService.getAdmins.mockResolvedValueOnce([mockAdmin1]);
        mockMailService.sendMail.mockResolvedValueOnce(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);
        const lastFiveUsers = users.slice(-5);
        expect(mockMailService.sendMail).toHaveBeenCalledWith({
          to: 'admin1@example.com',
          subject: 'Bulk User Approval - 5 New Signups',
          template: 'user-approval-bulk',
          context: {
            users: lastFiveUsers.map((u) => ({
              email: u.email,
              name: u.email.split('@')[0],
            })),
            userCount: 5,
            approvalUrl: `https://example.com/admin/approve?userIds=${lastFiveUsers.map((u) => u.id).join(',')}`,
          },
        });
      });

      it('should send bulk notification to multiple admins', async () => {
        const mockJob = {
          data: { userId: 'user-8' },
          id: 'job-123',
        } as Job<NotificationJobData>;

        const users = Array.from({ length: 8 }, (_, i) => ({
          id: `user-${i + 1}`,
          email: `user${i + 1}@example.com`,
          status: UserStatus.UNVERIFIED,
        }));

        mockUserService.getUserById.mockResolvedValueOnce(users[7]);
        mockUserService.getUnverifiedUsersInLast24Hours.mockResolvedValueOnce(
          users,
        );
        mockUserService.getAdmins.mockResolvedValueOnce([
          mockAdmin1,
          mockAdmin2,
        ]);
        mockMailService.sendMail.mockResolvedValue(true);

        await processor.process(mockJob);

        expect(mockMailService.sendMail).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenCalledWith(
          'Sent bulk approval notification for 5 users to 2 admin(s)',
        );
      });
    });

    it('should handle errors and throw them', async () => {
      const mockJob = {
        data: { userId: 'user-123' },
        id: 'job-123',
      } as Job<NotificationJobData>;

      const testError = new Error('Database connection failed');
      mockUserService.getUserById.mockRejectedValueOnce(testError);

      await expect(processor.process(mockJob)).rejects.toThrow(testError);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to process notification job ${mockJob.id}: ${testError.message}`,
      );
    });
  });
});
