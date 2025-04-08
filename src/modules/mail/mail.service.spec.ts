import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailData } from '~/types/mail.type';

const mockMailQueue = {
  add: jest.fn(),
};

let errorSpy: jest.SpyInstance;

describe('MailService', () => {
  let service: MailService;
  let queue: Queue;

  beforeEach(async () => {
    jest.clearAllMocks();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('mail'),
          useValue: mockMailQueue,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    queue = module.get<Queue>(getQueueToken('mail'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    const mailData: MailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test.',
      html: '<p>This is a test.</p>',
      from: 'sender@example.com',
      context: {},
    };

    it('should add a job to the mail queue with current year in context', async () => {
      mockMailQueue.add.mockResolvedValueOnce({ id: 'job-123' });
      const currentYear = new Date().getFullYear();
      const expectedData = {
        ...mailData,
        context: {
          ...mailData.context,
          currentYear,
        },
      };

      await service.sendMail(mailData);
      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith('send-mail', expectedData);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should log an error and re-throw if adding to the queue fails', async () => {
      const errorMessage = 'Queue connection failed';
      const testError = new Error(errorMessage);
      testError.stack = 'Error: Queue connection failed\n    at ...';
      mockMailQueue.add.mockRejectedValueOnce(testError);
      await expect(service.sendMail(mailData)).rejects.toThrow(
        `Email queueing failed: ${errorMessage}`,
      );
      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to add email job to queue for ${mailData.to}`,
        testError.stack,
      );
    });

    it('should handle errors that are not Error instances', async () => {
      const nonErrorObject = { message: 'Something weird happened' };
      mockMailQueue.add.mockRejectedValueOnce(nonErrorObject);
      await expect(service.sendMail(mailData)).rejects.toThrow(
        `Email queueing failed: Something weird happened`,
      );
      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to add email job to queue for ${mailData.to}`,
        undefined,
      );
    });
  });
});
