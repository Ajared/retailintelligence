import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerStorage,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { LimiterGuard } from './limiter.guard';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '~/helpers/custom.exception';

const mockThrottlerGuardHandleRequest = jest.fn<
  Promise<boolean>,
  [ThrottlerRequest]
>();

const createMockExecutionContext = (): ExecutionContext => {
  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue({ ip: '127.0.0.1' }),
    getResponse: jest.fn(),
    getNext: jest.fn(),
  };
  const mockHandler = jest.fn();
  Object.defineProperty(mockHandler, 'name', {
    value: 'mockHandlerName',
    writable: false,
  });
  const mockClass = { name: 'MockControllerName' };

  return {
    switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    getHandler: jest.fn().mockReturnValue(mockHandler),
    getClass: jest.fn().mockReturnValue(mockClass),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn().mockReturnValue('http'),
  } as ExecutionContext;
};

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

class MockThrottlerStorage implements ThrottlerStorage {
  storage: Record<
    string,
    {
      totalHits: number;
      expiryTime: number;
      blockExpiryTime?: number;
    }
  > = {};

  async getRecord(key: string): Promise<number[]> {
    const record = this.storage[key];
    const now = Date.now();
    if (
      record &&
      record.expiryTime <= now &&
      (!record.blockExpiryTime || record.blockExpiryTime <= now)
    ) {
      delete this.storage[key];
      return [];
    }
    if (record && record.expiryTime > now) {
      const timestamps: number[] = new Array(record.totalHits).fill(now);
      return timestamps;
    }
    return [];
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const ttlMillis = ttl * 1000;
    const blockDurationMillis = blockDuration * 1000;
    const now = Date.now();

    let currentStoredRecord = this.storage[key];

    if (
      currentStoredRecord &&
      currentStoredRecord.expiryTime <= now &&
      (!currentStoredRecord.blockExpiryTime ||
        currentStoredRecord.blockExpiryTime <= now)
    ) {
      delete this.storage[key];
      currentStoredRecord = undefined!;
    } else if (
      currentStoredRecord &&
      currentStoredRecord.expiryTime <= now &&
      currentStoredRecord.blockExpiryTime &&
      currentStoredRecord.blockExpiryTime > now
    ) {
      currentStoredRecord.totalHits = 0;
      currentStoredRecord.expiryTime = now + ttlMillis;
    }

    let recordToProcess: {
      totalHits: number;
      expiryTime: number;
      blockExpiryTime?: number;
    } = { totalHits: 0, expiryTime: now + ttlMillis };

    if (currentStoredRecord) {
      recordToProcess = currentStoredRecord;
      if (recordToProcess.expiryTime > now) {
        recordToProcess.totalHits += 1;
      }
    } else {
      recordToProcess.totalHits = 1;
    }

    let isBlocked = false;
    let timeToBlockExpire = 0;

    if (
      recordToProcess.blockExpiryTime &&
      recordToProcess.blockExpiryTime > now
    ) {
      isBlocked = true;
      timeToBlockExpire = recordToProcess.blockExpiryTime;
    } else if (
      recordToProcess.totalHits > limit &&
      recordToProcess.expiryTime > now
    ) {
      isBlocked = true;
      if (
        !recordToProcess.blockExpiryTime ||
        recordToProcess.blockExpiryTime <= now
      ) {
        recordToProcess.blockExpiryTime = now + blockDurationMillis;
      }
      timeToBlockExpire = recordToProcess.blockExpiryTime!;
    } else {
      delete recordToProcess.blockExpiryTime;
    }

    this.storage[key] = recordToProcess;

    return {
      totalHits: recordToProcess.totalHits,
      timeToExpire: recordToProcess.expiryTime,
      isBlocked: isBlocked,
      timeToBlockExpire: timeToBlockExpire,
    };
  }
}

describe('LimiterGuard', () => {
  let guard: LimiterGuard;
  let mockExecutionContext: ExecutionContext;
  let mockStorage: MockThrottlerStorage;
  let handleRequestSpy: jest.SpyInstance<Promise<boolean>, [ThrottlerRequest]>;

  beforeEach(async () => {
    mockThrottlerGuardHandleRequest.mockClear();
    mockStorage = new MockThrottlerStorage();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      providers: [
        LimiterGuard,
        ThrottlerGuard,
        Reflector,
        {
          provide: ThrottlerStorage,
          useValue: mockStorage,
        },
      ],
    }).compile();

    guard = module.get<LimiterGuard>(LimiterGuard);
    mockExecutionContext = createMockExecutionContext();

    handleRequestSpy = jest
      .spyOn(
        ThrottlerGuard.prototype as unknown as {
          handleRequest: (requestProps: ThrottlerRequest) => Promise<boolean>;
        },
        'handleRequest',
      )
      .mockImplementation(mockThrottlerGuardHandleRequest);
  });

  afterEach(() => {
    handleRequestSpy.mockRestore();
  });

  it('should be defined', () => expect(guard).toBeDefined());
  describe('handleRequest', () => {
    const createMockRequestProps = (
      context: ExecutionContext,
    ): ThrottlerRequest => ({
      context: context,
      throttler: {
        limit: 10,
        ttl: 60000,
        blockDuration: 0,
        name: 'default',
        getTracker: jest.fn().mockReturnValue('127.0.0.1'),
        generateKey: jest.fn().mockReturnValue('default:127.0.0.1'),
      },
      limit: 0,
      ttl: 0,
      blockDuration: 0,
      getTracker: function (
        _req: Record<string, unknown>,
        _context: ExecutionContext,
      ): Promise<string> | string {
        throw new Error('Function not implemented.');
      },
      generateKey: function (
        _context: ExecutionContext,
        _trackerString: string,
        _throttlerName: string,
      ): string {
        throw new Error('Function not implemented.');
      },
    });

    it('should return true when super.handleRequest succeeds', async () => {
      const mockRequestProps = createMockRequestProps(mockExecutionContext);
      mockThrottlerGuardHandleRequest.mockResolvedValue(true);

      const result = await guard.handleRequest(mockRequestProps);

      expect(result).toBe(true);
      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledTimes(1);
      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledWith(
        mockRequestProps,
      );
    });

    it('should throw CustomHttpException when super.handleRequest throws ThrottlerException', async () => {
      const mockRequestProps = createMockRequestProps(mockExecutionContext);
      const originalError = new ThrottlerException('Too Many Requests Test');
      mockThrottlerGuardHandleRequest.mockRejectedValue(originalError);

      const expectedResourceName = 'MockControllerName[mockHandlerName]';
      const expectedErrorMessage =
        SYS_MSG.RESOURCE_CURRENTLY_UNAVAILABLE(expectedResourceName);

      await expect(guard.handleRequest(mockRequestProps)).rejects.toThrow(
        CustomHttpException,
      );

      try {
        await guard.handleRequest(mockRequestProps);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        const customError = error as CustomHttpException;
        expect(customError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(customError.getResponse()).toMatchObject({
          message: originalError.message,
          error: expectedErrorMessage,
        });
        expect(customError.getResponse()).not.toHaveProperty('statusCode');
      }

      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledTimes(2);
      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledWith(
        mockRequestProps,
      );
    });

    it('should re-throw the original error if super.handleRequest throws a non-ThrottlerException', async () => {
      const mockRequestProps = createMockRequestProps(mockExecutionContext);
      const originalError = new Error('Something unexpected happened');
      mockThrottlerGuardHandleRequest.mockRejectedValue(originalError);

      await expect(guard.handleRequest(mockRequestProps)).rejects.toThrow(
        Error,
      );
      await expect(guard.handleRequest(mockRequestProps)).rejects.not.toThrow(
        CustomHttpException,
      );
      await expect(guard.handleRequest(mockRequestProps)).rejects.toEqual(
        originalError,
      );

      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledTimes(3);
      expect(mockThrottlerGuardHandleRequest).toHaveBeenCalledWith(
        mockRequestProps,
      );
    });
  });
});
