import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AssignLocation1751810939581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'assigned_state_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['assigned_state_id'],
        referencedTableName: 'states',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_users_assigned_state',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'assigned_local_government_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['assigned_local_government_id'],
        referencedTableName: 'local_governments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_users_assigned_lga',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'assigned_phase_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['assigned_phase_id'],
        referencedTableName: 'phases',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_users_assigned_phase',
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'assigned_district_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['assigned_district_id'],
        referencedTableName: 'districts',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_users_assigned_district',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'FK_users_assigned_district');
    await queryRunner.dropForeignKey('users', 'FK_users_assigned_phase');
    await queryRunner.dropForeignKey('users', 'FK_users_assigned_lga');
    await queryRunner.dropForeignKey('users', 'FK_users_assigned_state');

    await queryRunner.dropColumn('users', 'assigned_district_id');
    await queryRunner.dropColumn('users', 'assigned_phase_id');
    await queryRunner.dropColumn('users', 'assigned_local_government_id');
    await queryRunner.dropColumn('users', 'assigned_state_id');
  }
}
