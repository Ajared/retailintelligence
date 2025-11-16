import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  NotificationService,
  NotificationJobData,
} from './notification.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';

const mockNotificationQueue = {
  add: jest.fn(),
};

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;

describe('NotificationService', () => {
  let service: NotificationService;
  let queue: Queue;

  beforeEach(async () => {
    jest.clearAllMocks();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getQueueToken('notification'),
          useValue: mockNotificationQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    queue = module.get<Queue>(getQueueToken('notification'));

    logSpy.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyNewUserSignup', () => {
    const userId = 'user-123';

    it('should add a job to the notification queue and log success', async () => {
      const mockJob = { id: 'job-123' };
      mockNotificationQueue.add.mockResolvedValueOnce(mockJob);
      const expectedData: NotificationJobData = { userId };

      const result = await service.notifyNewUserSignup(userId);

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith('notify-new-signup', expectedData);
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Notification job added to queue for user ${userId} with job ID: ${mockJob.id}.`,
      );
      expect(errorSpy).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should log an error and return false if adding to the queue fails', async () => {
      const errorMessage = 'Queue connection failed';
      const testError = new Error(errorMessage);
      mockNotificationQueue.add.mockRejectedValueOnce(testError);
      logSpy.mockClear();

      const result = await service.notifyNewUserSignup(userId);

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to add notification job to queue for user ${userId}`,
        testError.message,
      );
      expect(logSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
