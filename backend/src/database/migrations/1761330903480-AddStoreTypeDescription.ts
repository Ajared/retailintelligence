import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddStoreTypeDescription1761330903480
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'store_type_description',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
            UPDATE stores 
            SET store_type_description = store_type
            WHERE store_type IS NOT NULL 
            AND store_type != '' 
            AND store_type != 'OTHER'
        `);

    await queryRunner.query(`
            UPDATE stores 
            SET store_type = 'OTHER'
            WHERE store_type IS NOT NULL
        `);

    await queryRunner.query(`
            UPDATE stores 
            SET store_type = 'OTHER',
                store_type_description = 'Legacy store type - migrated from previous system'
            WHERE store_type IS NULL OR store_type = ''
        `);

    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        columnNames: ['store_type'],
        name: 'IDX_stores_store_type',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('stores', 'IDX_stores_store_type');

    await queryRunner.query(`
            UPDATE stores 
            SET store_type = store_type_description
            WHERE store_type_description IS NOT NULL AND store_type_description != ''
        `);

    await queryRunner.dropColumn('stores', 'store_type_description');
  }
}
