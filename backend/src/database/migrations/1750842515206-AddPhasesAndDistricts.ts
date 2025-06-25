import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddPhasesAndDistricts1750842515206 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'phases',
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
            name: 'state_id',
            type: 'uuid',
            isNullable: false,
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
        foreignKeys: [
          {
            columnNames: ['state_id'],
            referencedTableName: 'states',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
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
            name: 'phase_id',
            type: 'uuid',
            isNullable: false,
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
        foreignKeys: [
          {
            columnNames: ['phase_id'],
            referencedTableName: 'phases',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'phase_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'stores',
      new TableColumn({
        name: 'district_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'stores',
      new TableForeignKey({
        columnNames: ['phase_id'],
        referencedTableName: 'phases',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'stores',
      new TableForeignKey({
        columnNames: ['district_id'],
        referencedTableName: 'districts',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'phases',
      new TableIndex({
        columnNames: ['state_id'],
        name: 'IDX_phases_state_id',
      }),
    );

    await queryRunner.createIndex(
      'districts',
      new TableIndex({
        columnNames: ['phase_id'],
        name: 'IDX_districts_phase_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const storesTable = await queryRunner.getTable('stores');

    if (storesTable) {
      const districtFk = storesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('district_id') !== -1,
      );
      if (districtFk) {
        await queryRunner.dropForeignKey('stores', districtFk);
      }

      const phaseFk = storesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('phase_id') !== -1,
      );
      if (phaseFk) {
        await queryRunner.dropForeignKey('stores', phaseFk);
      }

      await queryRunner.dropColumn('stores', 'district_id');
      await queryRunner.dropColumn('stores', 'phase_id');
    }

    await queryRunner.dropIndex('districts', 'IDX_districts_phase_id');
    await queryRunner.dropIndex('phases', 'IDX_phases_state_id');

    await queryRunner.dropTable('districts');
    await queryRunner.dropTable('phases');
  }
}
