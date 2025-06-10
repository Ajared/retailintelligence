import {
  DeepPartial,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { computePaginationMeta, PaginationMeta } from '~/helpers/query.helper';
import ListGenericRecord from '~/types/generic/list-record.type';
import CreateGenericRecord from '~/types/generic/create-record.type';
import UpdateGenericRecord from '~/types/generic/update-record.type';
import DeleteGenericRecord from '~/types/generic/delete-record.type';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class AbstractModelAction<T extends ObjectLiteral> {
  model: EntityTarget<T>;

  constructor(
    protected readonly repository: Repository<T>,
    model: EntityTarget<T>,
  ) {
    this.model = model;
  }

  async create(
    createRecordOptions: CreateGenericRecord<DeepPartial<T>>,
  ): Promise<T | null> {
    const { createPayload, transactionOptions } = createRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    const response: T | null = (await modelRepository.save(
      createPayload,
    )) as T | null;
    return response;
  }

  async update(
    updateRecordOptions: UpdateGenericRecord<
      QueryDeepPartialEntity<T>,
      FindOptionsWhere<T>
    >,
  ) {
    const { updatePayload, identifierOptions, transactionOptions } =
      updateRecordOptions;
    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    await modelRepository.update(identifierOptions, updatePayload);
    return await modelRepository.findOne({ where: identifierOptions });
  }

  async delete(deleteRecordOptions: DeleteGenericRecord<FindOptionsWhere<T>>) {
    const { identifierOptions, transactionOptions } = deleteRecordOptions;
    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;
    return await modelRepository.delete(identifierOptions);
  }

  async get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: object,
  ) {
    return await this.repository.findOne({
      where: getRecordIdentifierOptions,
      ...queryOptions,
      relations,
    });
  }
  async list(
    listRecordOptions: ListGenericRecord<object>,
  ): Promise<{ payload: T[]; paginationMeta: PaginationMeta }> {
    const { paginationPayload, filterRecordOptions, relations } =
      listRecordOptions;

    if (!filterRecordOptions) {
      const defaultOrder = {
        createdAt: 'DESC',
      } as unknown as FindOptionsOrder<T>;
      if (paginationPayload) {
        const { limit, page } = paginationPayload;
        const query = await this.repository.find({
          relations,
          take: +limit,
          skip: +limit * (+page - 1),
          order: defaultOrder,
        });

        const total = await this.repository.count();

        return {
          payload: query,
          paginationMeta: computePaginationMeta(total, +limit, +page),
        };
      }

      const query = await this.repository.find({
        relations,
        order: defaultOrder,
      });

      return {
        payload: query,
        paginationMeta: computePaginationMeta(query.length, query.length, 1),
      };
    }

    const { sort, ...filter } = filterRecordOptions as {
      sort?: 'ASC' | 'DESC';
    } & Record<string, unknown>;

    const orderBy = {} as FindOptionsOrder<T>;
    if (sort) {
      Object.keys(filter).forEach((key) => {
        (orderBy as unknown as Record<string, 'ASC' | 'DESC'>)[key] = sort;
      });
    } else {
      (orderBy as unknown as Record<string, 'ASC' | 'DESC'>).createdAt = 'DESC';
    }

    if (paginationPayload) {
      const { limit, page } = paginationPayload;
      const query = await this.repository.find({
        where: filter as FindOptionsWhere<T>,
        relations,
        take: +limit,
        skip: +limit * (+page - 1),
        order: orderBy,
      });

      const total = await this.repository.count({
        where: filter as FindOptionsWhere<T>,
      });

      return {
        payload: query,
        paginationMeta: computePaginationMeta(total, +limit, +page),
      };
    }

    const query = await this.repository.find({
      where: filter as FindOptionsWhere<T>,
      relations,
      order: orderBy,
    });
    return {
      payload: query,
      paginationMeta: computePaginationMeta(query.length, query.length, 1),
    };
  }
}
