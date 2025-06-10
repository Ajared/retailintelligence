import { Response } from 'express';
import { Workbook } from 'exceljs';
import { stringify } from 'csv-stringify';
import { StoreDto } from './dto/store.dto';
import * as SYS_MSG from '~/helpers/system-messages';
import { StoreModelAction } from './store.model-action';
import { StoreInterface } from './types/store.interface';
import { AbstractResponseDto } from '~/types/response.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { NullishValueError, trySafe } from '~/helpers/try-safe';
import { CustomHttpException } from '~/helpers/custom.exception';
import CreateStoreRecordOptions from './types/create-store.type';
import UpdateStoreRecordOptions from './types/update-store.type';
import { ExportType, QueryOptions } from '~/helpers/query.helper';
import {
  ListStoreRecordOptions,
  StoreQueryOptions,
} from './types/list-store.type';
import { EntityPropertyNotFoundError } from 'typeorm';

@Injectable()
export class StoreService {
  constructor(private readonly storeModelAction: StoreModelAction) {}
  private readonly logger = new Logger('StoreService');

  async createStore(
    enumeratorId: string,
    storeDto: StoreDto,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const { name } = storeDto;

    const [existingStoreError, existingStore] = await trySafe(() =>
      this.storeModelAction.get({ name }),
    );

    if (
      existingStoreError &&
      !(existingStoreError instanceof NullishValueError)
    ) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (existingStore) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_ALREADY_EXISTS('Store'),
        HttpStatus.CONFLICT,
      );
    }

    const createStorePayload: CreateStoreRecordOptions = {
      createPayload: { ...storeDto, enumeratorId },
      transactionOptions: { useTransaction: false },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.create(createStorePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_CREATION_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_CREATED_SUCCESSFULLY('Store'),
    };
  }

  async getStoreById(
    id: string,
    queryOptions?: Record<string, unknown>,
    relations?: Record<string, unknown>,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const [error, data] = await trySafe(() =>
      this.storeModelAction.get({ id }, queryOptions, {
        ...relations,
        state: true,
        enumerator: true,
        localGovernment: true,
      }),
    );

    if (error) {
      if (error instanceof NullishValueError) {
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_NOT_FOUND('Store'),
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Store'),
    };
  }

  async listStores(
    queryOptions: StoreQueryOptions,
  ): Promise<AbstractResponseDto<StoreInterface[]>> {
    const { page, limit, ...filterOptions } = queryOptions;

    const filterRecordOptions = Object.fromEntries(
      Object.entries(filterOptions).filter(
        ([, value]) => value !== undefined && value !== '',
      ),
    );

    const paginationPayload = {
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
    };

    const listStoreRecordOptions: ListStoreRecordOptions = {
      paginationPayload,
      filterRecordOptions,
      relations: {
        state: true,
        enumerator: true,
        localGovernment: true,
      },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.list(listStoreRecordOptions),
    );

    if (error) {
      if (error instanceof EntityPropertyNotFoundError) {
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Filter Query'),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data: data.payload,
      meta: data.paginationMeta,
      message: SYS_MSG.RESOURCE_FETCHED_SUCCESSFULLY('Stores'),
    };
  }

  async updateStore(
    id: string,
    storeDto: StoreDto,
  ): Promise<AbstractResponseDto<StoreInterface>> {
    const updateStorePayload: UpdateStoreRecordOptions = {
      identifierOptions: { id },
      updatePayload: storeDto,
      transactionOptions: { useTransaction: false },
    };

    const [error, data] = await trySafe(() =>
      this.storeModelAction.update(updateStorePayload),
    );

    if (error) {
      throw new CustomHttpException(
        SYS_MSG.RESOURCE_UPDATE_FAILED('Store'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      data,
      message: SYS_MSG.RESOURCE_UPDATED_SUCCESSFULLY('Store'),
    };
  }

  async exportStores(response: Response, queryOptions: QueryOptions) {
    try {
      const { page, limit, exportType } = queryOptions;

      const { contentType, filename } = this.getExportMetadata(
        exportType ?? ExportType.JSON,
      );

      response.setHeader('Content-Type', contentType);
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      const paginationPayload = {
        page: page ? +page : 1,
        limit: limit ? +limit : 10,
      };

      const listStoreRecordOptions: ListStoreRecordOptions = {
        paginationPayload,
        filterRecordOptions: {},
        relations: {
          state: true,
          enumerator: true,
          localGovernment: true,
        },
      };

      const [error, data] = await trySafe(() =>
        this.storeModelAction.list(listStoreRecordOptions),
      );

      if (error) {
        if (!response.headersSent) {
          response.flushHeaders();
        }
        throw new CustomHttpException(
          SYS_MSG.RESOURCE_FETCH_FAILED('Stores'),
          HttpStatus.INTERNAL_SERVER_ERROR,
          error instanceof Error ? error.message : 'Unknown error occurred',
        );
      }

      if (!data || !data.payload || data.payload.length === 0) {
        if (!response.headersSent) {
          response.flushHeaders();
        }
        response.status(HttpStatus.OK).send('No store data found to export.');
        return;
      }

      if (!response.headersSent) {
        response.flushHeaders();
      }

      try {
        switch (exportType) {
          case ExportType.JSON:
            await this._streamJson(data.payload, response);
            break;
          case ExportType.CSV:
            await this._streamCsv(data.payload, response);
            break;
          case ExportType.EXCEL:
            await this._streamExcel(data.payload, response);
            break;
          default:
            if (!response.writableEnded) {
              response.status(HttpStatus.BAD_REQUEST).send({
                message: SYS_MSG.INVALID_PARAMETER('Export Type'),
              });
            } else {
              this.logger.error(
                'Invalid export type, but response already finished.',
              );
            }
            return;
        }

        if (exportType === ExportType.JSON || exportType === ExportType.EXCEL) {
          if (!response.writableEnded) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
              error: SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'),
              message: SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'),
            });
          }
        }
      } catch (streamError) {
        this.logger.error('Streaming/Writing error:', streamError);
        if (!response.writableEnded) {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error:
              streamError instanceof Error
                ? streamError.message
                : 'Unknown error occurred',
            message: SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'),
          });
        }
      }
    } catch (error) {
      if (!response.headersSent) {
        if (error instanceof CustomHttpException) {
          response
            .status(error.getStatus())
            .json({ message: error.message, details: error.getResponse() });
        } else {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: SYS_MSG.RESOURCE_EXPORT_FAILED('Stores'),
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      } else {
        this.logger.error('Error after headers sent:', error);
        if (!response.writableEnded) {
          response.end();
        }
      }
    }
  }

  private getExportMetadata(type: ExportType): {
    contentType: string;
    filename: string;
  } {
    const timestamp = new Date()
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/[/: ]/g, '-');

    switch (type) {
      case ExportType.JSON:
        return {
          contentType: 'application/json',
          filename: `stores-${timestamp}.json`,
        };
      case ExportType.CSV:
        return {
          contentType: 'text/csv',
          filename: `stores-${timestamp}.csv`,
        };
      case ExportType.EXCEL:
        return {
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: `stores-${timestamp}.xlsx`,
        };
      default:
        throw new CustomHttpException(
          SYS_MSG.INVALID_PARAMETER('Export Type'),
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private async _streamJson(
    stores: StoreInterface[],
    response: Response,
  ): Promise<void> {
    response.write(JSON.stringify(stores, null, 2));
  }

  private async _streamCsv(
    stores: StoreInterface[],
    response: Response,
  ): Promise<void> {
    if (!stores || stores.length === 0) {
      return;
    }

    const columns = Object.keys(stores[0]).map((key) => ({ key, header: key }));

    const stringifier = stringify({ header: true, columns: columns });

    stringifier.pipe(response);

    for (const store of stores) {
      stringifier.write(store);
    }

    stringifier.end();

    await new Promise((resolve, reject) => {
      stringifier.on('finish', resolve);
      stringifier.on('error', reject);
      response.on('error', reject);
    });
  }

  private async _streamExcel(
    stores: StoreInterface[],
    response: Response,
  ): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Stores');
    const columns = Object.keys(stores[0] || {}).map((key) => ({
      header:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      key,
      width: key.length * 2 + 10,
    }));

    worksheet.columns = columns;

    stores.forEach((store) => {
      worksheet.addRow(store);
    });

    try {
      await workbook.xlsx.write(response);
    } catch (error) {
      this.logger.error('Failed to write Excel workbook:', error);
      throw error;
    }
  }
}
