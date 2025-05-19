import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailData } from '~/types/mail.type';
import { MailService } from './mail.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';

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

    it('should log an error if adding to the queue fails', async () => {
      const errorMessage = 'Queue connection failed';
      const testError = new Error(errorMessage);
      mockMailQueue.add.mockRejectedValueOnce(testError);

      await service.sendMail(mailData);

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to add email job to queue for ${mailData.to}`,
        testError.message,
      );
    });
  });
});
