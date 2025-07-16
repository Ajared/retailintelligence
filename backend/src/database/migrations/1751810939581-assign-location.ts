import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AssignLocation1751810939581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAssignedStateId = await queryRunner.hasColumn(
      'users',
      'assigned_state_id',
    );
    if (!hasAssignedStateId) {
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
    }

    const hasAssignedLocalGovId = await queryRunner.hasColumn(
      'users',
      'assigned_local_government_id',
    );
    if (!hasAssignedLocalGovId) {
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
    }

    const hasAssignedPhaseId = await queryRunner.hasColumn(
      'users',
      'assigned_phase_id',
    );
    if (!hasAssignedPhaseId) {
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
    }

    const hasAssignedDistrictId = await queryRunner.hasColumn(
      'users',
      'assigned_district_id',
    );
    if (!hasAssignedDistrictId) {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('users', 'assigned_district_id')) {
      await queryRunner.dropForeignKey('users', 'FK_users_assigned_district');
      await queryRunner.dropColumn('users', 'assigned_district_id');
    }

    if (await queryRunner.hasColumn('users', 'assigned_phase_id')) {
      await queryRunner.dropForeignKey('users', 'FK_users_assigned_phase');
      await queryRunner.dropColumn('users', 'assigned_phase_id');
    }

    if (await queryRunner.hasColumn('users', 'assigned_local_government_id')) {
      await queryRunner.dropForeignKey('users', 'FK_users_assigned_lga');
      await queryRunner.dropColumn('users', 'assigned_local_government_id');
    }

    if (await queryRunner.hasColumn('users', 'assigned_state_id')) {
      await queryRunner.dropForeignKey('users', 'FK_users_assigned_state');
      await queryRunner.dropColumn('users', 'assigned_state_id');
    }
  }
}
