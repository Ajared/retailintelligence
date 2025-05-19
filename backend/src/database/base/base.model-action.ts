import {
  DeepPartial,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import ListGenericRecord from '~/types/generic/list-record.type';
import {
  computePaginationMeta,
  PaginationMeta,
} from '~/helpers/pagination.helper';
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

    if (paginationPayload) {
      const { limit, page } = paginationPayload;
      const query = await this.repository.find({
        where: filterRecordOptions,
        relations,
        take: +limit,
        skip: +limit * (+page - 1),
      });

      const total = await this.repository.count({ where: filterRecordOptions });

      return {
        payload: query,
        paginationMeta: computePaginationMeta(total, +limit, +page),
      };
    }

    const query = await this.repository.find({
      where: filterRecordOptions,
      relations,
    });
    return {
      payload: query,
      paginationMeta: computePaginationMeta(query.length, query.length, 1),
    };
  }
}
