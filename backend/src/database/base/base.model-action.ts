import {
  DeepPartial,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  ILike,
  Between,
} from 'typeorm';
import { computePaginationMeta, PaginationMeta } from '~/helpers/query.helper';
import ListGenericRecord from '~/types/generic/list-record.type';
import CreateGenericRecord from '~/types/generic/create-record.type';
import UpdateGenericRecord from '~/types/generic/update-record.type';
import DeleteGenericRecord from '~/types/generic/delete-record.type';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class AbstractModelAction<T extends ObjectLiteral> {
  model: EntityTarget<T>;
  protected readonly partialSearchFields: string[] = [];
  protected readonly rangeFields: string[] = [];

  constructor(
    protected readonly repository: Repository<T>,
    model: EntityTarget<T>,
    partialSearchFields: readonly string[] = [],
    rangeFields: readonly string[] = [],
  ) {
    this.model = model;
    this.partialSearchFields = [...partialSearchFields];
    this.rangeFields = [...rangeFields];
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

    // Build where clause with partial search and range support
    const whereClause: FindOptionsWhere<T> = {};
    const processedRangeFields = new Set<string>();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle range fields (lat/lng bounds)
        if (this.isRangeField(key)) {
          const baseField = this.getBaseFieldFromRangeKey(key);
          if (!processedRangeFields.has(baseField)) {
            const rangeValue = this.buildRangeQuery(baseField, filter);
            if (rangeValue) {
              (whereClause as Record<string, unknown>)[baseField] = rangeValue;
              processedRangeFields.add(baseField);
            }
          }
        }
        // Handle partial search fields
        else if (
          this.partialSearchFields.includes(key) &&
          typeof value === 'string'
        ) {
          (whereClause as Record<string, unknown>)[key] = ILike(`%${value}%`);
        }
        // Handle exact match fields
        else if (!this.isRangeKey(key)) {
          (whereClause as Record<string, unknown>)[key] = value;
        }
      }
    });

    const orderBy = {} as FindOptionsOrder<T>;
    if (sort) {
      Object.keys(filter).forEach((key) => {
        if (
          key !== 'sort' &&
          !this.partialSearchFields.includes(key) &&
          !this.isRangeKey(key)
        ) {
          (orderBy as unknown as Record<string, 'ASC' | 'DESC'>)[key] = sort;
        }
      });

      if (Object.keys(orderBy as object).length === 0) {
        (orderBy as unknown as Record<string, 'ASC' | 'DESC'>).createdAt =
          'DESC';
      }
    } else {
      (orderBy as unknown as Record<string, 'ASC' | 'DESC'>).createdAt = 'DESC';
    }

    if (paginationPayload) {
      const { limit, page } = paginationPayload;
      const query = await this.repository.find({
        where: whereClause,
        relations,
        take: +limit,
        skip: +limit * (+page - 1),
        order: orderBy,
      });

      const total = await this.repository.count({
        where: whereClause,
      });

      return {
        payload: query,
        paginationMeta: computePaginationMeta(total, +limit, +page),
      };
    }

    const query = await this.repository.find({
      where: whereClause,
      relations,
      order: orderBy,
    });
    return {
      payload: query,
      paginationMeta: computePaginationMeta(query.length, query.length, 1),
    };
  }

  private isRangeField(key: string): boolean {
    if (!this.isRangeKey(key)) return false;
    const baseField = this.getBaseFieldFromRangeKey(key);
    return this.rangeFields.includes(baseField);
  }

  private isRangeKey(key: string): boolean {
    return key.startsWith('min') || key.startsWith('max');
  }

  private getBaseFieldFromRangeKey(key: string): string {
    if (key.startsWith('min') || key.startsWith('max')) {
      // Convert minLat -> latitude, maxLng -> longitude, etc.
      const baseName = key.substring(3); // Remove 'min' or 'max'
      if (baseName === 'Lat') return 'latitude';
      if (baseName === 'Lng') return 'longitude';
      return baseName.toLowerCase();
    }
    return key;
  }

  private buildRangeQuery(
    baseField: string,
    filter: Record<string, unknown>,
  ): ReturnType<typeof Between> | null {
    let minKey: string, maxKey: string;

    // Map base field to min/max keys
    if (baseField === 'latitude') {
      minKey = 'minLat';
      maxKey = 'maxLat';
    } else if (baseField === 'longitude') {
      minKey = 'minLng';
      maxKey = 'maxLng';
    } else {
      minKey = `min${baseField.charAt(0).toUpperCase() + baseField.slice(1)}`;
      maxKey = `max${baseField.charAt(0).toUpperCase() + baseField.slice(1)}`;
    }

    const minValue = filter[minKey];
    const maxValue = filter[maxKey];

    // Both min and max values are required for range query
    if (
      minValue !== undefined &&
      maxValue !== undefined &&
      minValue !== null &&
      maxValue !== null
    ) {
      const min =
        typeof minValue === 'string' ? parseFloat(minValue) : Number(minValue);
      const max =
        typeof maxValue === 'string' ? parseFloat(maxValue) : Number(maxValue);

      if (
        !isNaN(min) &&
        !isNaN(max) &&
        typeof min === 'number' &&
        typeof max === 'number'
      ) {
        return Between(min, max);
      }
    }

    return null;
  }
}
