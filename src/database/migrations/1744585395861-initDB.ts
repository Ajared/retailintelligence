import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { StoreType } from '~/modules/store/constants/store.constant';

export class InitDB1744585395861 implements MigrationInterface {
  private readonly logger = new Logger('Migrations');

  private async typeExists(
    queryRunner: QueryRunner,
    typeName: string,
    schema: string = 'public',
  ): Promise<boolean> {
    const result: { length: number } = await queryRunner.query(
      `SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = $1 AND n.nspname = $2`,
      [typeName, schema],
    );
    return result.length > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.typeExists(queryRunner, 'auth_provider_enum'))) {
      await queryRunner.query(
        `CREATE TYPE "public"."auth_provider_enum" AS ENUM('local', 'google')`,
      );
    } else {
      this.logger.log('Enum type public.auth_provider_enum already exists.');
    }

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'auth_provider',
            type: '"public"."auth_provider_enum"',
            default: "'local'",
            isNullable: false,
          },
          {
            name: 'is_super_admin',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'reset_password_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reset_password_expires',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'districts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'local_governments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    if (!(await this.typeExists(queryRunner, 'store_type_enum'))) {
      await queryRunner.query(
        `CREATE TYPE "public"."store_type_enum" AS ENUM('${StoreType.RETAIL}', '${StoreType.WHOLESALE}')`,
      );
    }

    await queryRunner.createTable(
      new Table({
        name: 'stores',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'store_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'store_type',
            type: 'store_type_enum',
            isNullable: false,
          },
          {
            name: 'landmarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'photos',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
          },
          {
            name: 'district_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'local_government_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'enumerator_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['district_id'],
            referencedTableName: 'districts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['local_government_id'],
            referencedTableName: 'local_governments',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['enumerator_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stores', true);
    await queryRunner.dropTable('local_governments', true);
    await queryRunner.dropTable('districts', true);
    await queryRunner.dropTable('users', true);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."store_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."auth_provider_enum"`,
    );
  }
}
