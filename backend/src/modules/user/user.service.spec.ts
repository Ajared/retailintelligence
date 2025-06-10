import { UserService } from './user.service';
import * as SYS_MSG from '~/helpers/system-messages';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModelAction } from './user.model-action';
import {
  ListUserRecordOptions,
  UserQueryOptions,
} from './types/list-user.type';

interface MockUserModelAction {
  list: jest.Mock<
    Promise<{ payload: unknown[]; paginationMeta: unknown }>,
    [ListUserRecordOptions]
  >;
}

const createMockUserModelAction = (): MockUserModelAction => ({
  list: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let mockModelAction: MockUserModelAction;

  beforeEach(async () => {
    mockModelAction = createMockUserModelAction();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserModelAction,
          useValue: mockModelAction,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers', () => {
    it('should call modelAction.list with provided pagination options (as strings) and return formatted result', async () => {
      const queryOptions = { page: '2', limit: '20' };
      const mockData = [{ id: 'user-1', name: 'Test User' }];
      const mockMeta = { total: 1 };
      mockModelAction.list.mockResolvedValue({
        payload: mockData,
        paginationMeta: mockMeta,
      });

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 2,
          limit: 20,
        },
        filterRecordOptions: {},
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockData,
        meta: mockMeta,
      });
    });

    it('should call modelAction.list with default pagination when options are undefined', async () => {
      const queryOptions: UserQueryOptions = {};
      const mockResponse = { payload: [], paginationMeta: { total: 0 } };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 10,
        },
        filterRecordOptions: {},
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should call modelAction.list with default pagination when options is an empty object', async () => {
      const queryOptions: UserQueryOptions = {};
      const mockResponse = { payload: [], paginationMeta: { total: 0 } };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 10,
        },
        filterRecordOptions: {},
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should use default page when only limit is provided', async () => {
      const queryOptions: UserQueryOptions = { limit: '15' };
      const mockResponse = {
        payload: [{ id: 'user-2' }],
        paginationMeta: { total: 1 },
      };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 1,
          limit: 15,
        },
        filterRecordOptions: {},
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });

    it('should use default limit when only page is provided', async () => {
      const queryOptions: UserQueryOptions = { page: '4' };
      const mockResponse = {
        payload: [{ id: 'user-3' }],
        paginationMeta: { total: 1 },
      };
      mockModelAction.list.mockResolvedValue(mockResponse);

      const expectedListOptions: ListUserRecordOptions = {
        paginationPayload: {
          page: 4,
          limit: 10,
        },
        filterRecordOptions: {},
      };

      const result = await service.listUsers(queryOptions);

      expect(mockModelAction.list).toHaveBeenCalledTimes(1);
      expect(mockModelAction.list).toHaveBeenCalledWith(expectedListOptions);
      expect(result).toEqual({
        message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Users'),
        data: mockResponse.payload,
        meta: mockResponse.paginationMeta,
      });
    });
  });
});
