import { MigrationInterface, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';

export class UpdateUserStatusAndAddDeactivatedAt1759493969854
  implements MigrationInterface
{
  private readonly logger = new Logger('UpdateUserStatusAndAddDeactivatedAt');

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deactivatedAt column
    try {
      const hasColumn = await queryRunner.hasColumn('users', 'deactivated_at');
      if (!hasColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" 
          ADD COLUMN "deactivated_at" TIMESTAMP NULL
        `);
        this.logger.log('Added deactivated_at column to users table');
      } else {
        this.logger.log('deactivated_at column already exists');
      }
    } catch (error) {
      this.logger.error(
        'Failed to add deactivated_at column:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Create new enum type for status
    try {
      await queryRunner.query(`
        CREATE TYPE "user_status_new" AS ENUM ('verified', 'unverified')
      `);
      this.logger.log('Created new user_status_new enum type');
    } catch (error) {
      this.logger.log('user_status_new enum type may already exist');
    }

    // Add temporary column with new enum type
    try {
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD COLUMN "status_new" "user_status_new" DEFAULT 'unverified'
      `);
      this.logger.log('Added temporary status_new column');
    } catch (error) {
      this.logger.error(
        'Failed to add status_new column:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Migrate data: active -> verified, inactive -> unverified
    try {
      await queryRunner.query(`
        UPDATE "users" 
        SET "status_new" = CASE 
          WHEN "status" = 'active' THEN 'verified'::user_status_new
          ELSE 'unverified'::user_status_new
        END
      `);
      this.logger.log('Migrated status data from old to new enum');
    } catch (error) {
      this.logger.error(
        'Failed to migrate status data:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Drop old status column
    try {
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "status"
      `);
      this.logger.log('Dropped old status column');
    } catch (error) {
      this.logger.error(
        'Failed to drop old status column:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Rename new status column to status
    try {
      await queryRunner.query(`
        ALTER TABLE "users" RENAME COLUMN "status_new" TO "status"
      `);
      this.logger.log('Renamed status_new column to status');
    } catch (error) {
      this.logger.error(
        'Failed to rename status_new column:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Drop old enum type
    try {
      await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum"`);
      this.logger.log('Dropped old users_status_enum type');
    } catch (error) {
      this.logger.log('Old enum type may not exist or already dropped');
    }

    // Rename new enum type to match TypeORM convention
    try {
      await queryRunner.query(`
        ALTER TYPE "user_status_new" RENAME TO "users_status_enum"
      `);
      this.logger.log('Renamed user_status_new to users_status_enum');
    } catch (error) {
      this.logger.error(
        'Failed to rename enum type:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove deactivatedAt column
    try {
      const hasColumn = await queryRunner.hasColumn('users', 'deactivated_at');
      if (hasColumn) {
        await queryRunner.query(`
          ALTER TABLE "users" DROP COLUMN "deactivated_at"
        `);
        this.logger.log('Dropped deactivated_at column');
      }
    } catch (error) {
      this.logger.error(
        'Failed to drop deactivated_at column:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Reverse status enum changes
    try {
      // Create old enum type
      await queryRunner.query(`
        CREATE TYPE "user_status_old" AS ENUM ('active', 'inactive')
      `);

      // Add temporary column with old enum type
      await queryRunner.query(`
        ALTER TABLE "users" 
        ADD COLUMN "status_old" "user_status_old" DEFAULT 'inactive'
      `);

      // Migrate data back: verified -> active, unverified -> inactive
      await queryRunner.query(`
        UPDATE "users" 
        SET "status_old" = CASE 
          WHEN "status" = 'verified' THEN 'active'::user_status_old
          ELSE 'inactive'::user_status_old
        END
      `);

      // Drop new status column
      await queryRunner.query(`
        ALTER TABLE "users" DROP COLUMN "status"
      `);

      // Rename old status column back
      await queryRunner.query(`
        ALTER TABLE "users" RENAME COLUMN "status_old" TO "status"
      `);

      // Drop new enum type
      await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum"`);

      // Rename old enum type
      await queryRunner.query(`
        ALTER TYPE "user_status_old" RENAME TO "users_status_enum"
      `);

      this.logger.log('Reverted status enum changes');
    } catch (error) {
      this.logger.error(
        'Failed to revert status enum:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
