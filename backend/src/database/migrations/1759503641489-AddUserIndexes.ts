import { MigrationInterface, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';

export class AddUserIndexes1759503641489 implements MigrationInterface {
  private readonly logger = new Logger('AddUserIndexes');

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_users_status" 
        ON "users" ("status")
      `);
      this.logger.log('Created index on users.status');
    } catch (error) {
      this.logger.error(
        'Failed to create index on users.status:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_users_deactivated_at" 
        ON "users" ("deactivated_at")
      `);
      this.logger.log('Created index on users.deactivatedAt');
    } catch (error) {
      this.logger.error(
        'Failed to create index on users.deactivatedAt:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_users_status_deactivated_at" 
        ON "users" ("status", "deactivated_at")
      `);
      this.logger.log(
        'Created composite index on users.status and users.deactivatedAt',
      );
    } catch (error) {
      this.logger.error(
        'Failed to create composite index:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`
        DROP INDEX IF EXISTS "idx_users_status_deactivated_at"
      `);
      this.logger.log(
        'Dropped composite index on users.status and users.deactivatedAt',
      );
    } catch (error) {
      this.logger.error(
        'Failed to drop composite index:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    try {
      await queryRunner.query(`
        DROP INDEX IF EXISTS "idx_users_deactivated_at"
      `);
      this.logger.log('Dropped index on users.deactivatedAt');
    } catch (error) {
      this.logger.error(
        'Failed to drop index on users.deactivatedAt:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    try {
      await queryRunner.query(`
        DROP INDEX IF EXISTS "idx_users_status"
      `);
      this.logger.log('Dropped index on users.status');
    } catch (error) {
      this.logger.error(
        'Failed to drop index on users.status:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
