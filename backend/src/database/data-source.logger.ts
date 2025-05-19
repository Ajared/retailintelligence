import { Logger as TypeOrmLoggerInterface, QueryRunner } from 'typeorm';
import { Logger as NestLogger, LogLevel as NestLogLevel } from '@nestjs/common';

export class DataSourceLogger implements TypeOrmLoggerInterface {
  private readonly nestLogger: NestLogger;
  private readonly levelMapping: Record<string, NestLogLevel> = {
    log: 'log',
    info: 'log',
    warn: 'warn',
    error: 'error',
    query: 'debug',
    schema: 'debug',
    migration: 'log',
  };

  constructor(
    context = 'TypeORM',
    private readonly options?: { logParameters?: boolean },
  ) {
    this.nestLogger = new NestLogger(context);
  }

  private stringifyParams(parameters?: unknown[]): string {
    try {
      return JSON.stringify(parameters);
    } catch {
      return '--- Logging parameters failed ---';
    }
  }

  private writeLog(level: NestLogLevel, messages: string[]): void {
    messages.forEach((message) => {
      this.nestLogger[level](message);
    });
  }

  logQuery(
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    const messages = [`[QUERY] ${query}`];
    if (this.options?.logParameters && parameters && parameters.length > 0) {
      messages.push(`[PARAMS] ${this.stringifyParams(parameters)}`);
    }
    this.writeLog(this.levelMapping.query, messages);
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    const messages = [`[QUERY FAILED] ${query}`];
    if (this.options?.logParameters && parameters && parameters.length > 0) {
      messages.push(`[PARAMS] ${this.stringifyParams(parameters)}`);
    }
    messages.push(
      `[ERROR] ${typeof error === 'string' ? error : error.message}`,
    );
    if (error instanceof Error && error.stack) {
      messages.push(`[STACK] ${error.stack}`);
    }
    this.writeLog(this.levelMapping.error, messages);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    const messages = [`[SLOW QUERY: ${time}ms] ${query}`];
    if (this.options?.logParameters && parameters && parameters.length > 0) {
      messages.push(`[PARAMS] ${this.stringifyParams(parameters)}`);
    }
    this.writeLog(this.levelMapping.warn, messages);
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
    this.writeLog(this.levelMapping.schema, [`[SCHEMA] ${message}`]);
  }

  logMigration(message: string, _queryRunner?: QueryRunner): void {
    this.writeLog(this.levelMapping.migration, [`[MIGRATION] ${message}`]);
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    _queryRunner?: QueryRunner,
  ): void {
    const nestLevel = this.levelMapping[level] || 'log';
    const messageString =
      typeof message === 'string' ? message : JSON.stringify(message);
    this.writeLog(nestLevel, [`[${level.toUpperCase()}] ${messageString}`]);
  }
}
