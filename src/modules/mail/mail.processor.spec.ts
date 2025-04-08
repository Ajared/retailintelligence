import { Job } from 'bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { MailProcessor } from './mail.processor';
import { MailData } from '~/types/mail.type';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('MailProcessor', () => {
  let processor: MailProcessor;
  let mailerService: MailerService;
  let module: TestingModule;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        MailProcessor,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
    mailerService = module.get<MailerService>(MailerService);
  });

  beforeEach(() => {
    mockMailerService.sendMail.mockClear();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should send email successfully with all fields and log success', async () => {
      const jobData: MailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test Content',
        html: '<p>Test HTML</p>',
        cc: ['cc1@example.com', 'cc2@example.com'],
        bcc: ['bcc@example.com'],
        from: 'sender@example.com',
      };
      const mockJob = { data: jobData, id: 'test-job-id' } as Job<MailData>;

      mockMailerService.sendMail.mockResolvedValue({});

      const result = await processor.process(mockJob);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(jobData);
      expect(result).toBeUndefined();

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Email sent successfully to ${jobData.to} with job ID: ${mockJob.id}.`,
      );
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should send email successfully with only required fields and log success', async () => {
      const jobData: MailData = {
        to: 'minimal@example.com',
        subject: 'Minimal Subject',
      };
      const mockJob = { data: jobData, id: 'minimal-job-id' } as Job<MailData>;

      mockMailerService.sendMail.mockResolvedValue({});

      const result = await processor.process(mockJob);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(jobData);
      expect(result).toBeUndefined();

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Email sent successfully to ${jobData.to} with job ID: ${mockJob.id}.`,
      );
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle email sending failure and throw an error', async () => {
      const jobData: MailData = {
        to: 'fail@example.com',
        subject: 'Failure Test',
        text: 'This should fail',
      };
      const mockJob = { data: jobData } as Job<MailData>;
      const testError = new Error('SMTP Server Down');

      mockMailerService.sendMail.mockRejectedValue(testError);

      await expect(processor.process(mockJob)).rejects.toThrow(
        `Email sending failed: ${testError.message}`,
      );

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(jobData);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        `Failed to send email to ${jobData.to}: ${testError.message}`,
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should throw an error if recipient email (to) is missing', async () => {
      const mockJob = {
        data: { subject: 'Missing Recipient', text: 'This will not be sent' },
      } as Job<MailData>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Email sending failed: Recipient email address is required',
      );

      expect(mailerService.sendMail).not.toHaveBeenCalled();

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to send email to undefined: Recipient email address is required',
      );
      expect(logSpy).not.toHaveBeenCalled();
    });
  });
});
