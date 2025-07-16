import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMigrationConflicts1752616701095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`
                ALTER TABLE "stores" 
                ALTER COLUMN "local_government_id" DROP NOT NULL
            `);
    } catch (error) {
      console.log('local_government_id is already nullable or does not exist');
    }

    try {
      await queryRunner.query(`
                ALTER TABLE "stores" 
                ALTER COLUMN "state_id" DROP NOT NULL
            `);
    } catch (error) {
      console.log('state_id is already nullable or does not exist');
    }

    const tables = [
      'users',
      'stores',
      'states',
      'local_governments',
      'phases',
      'districts',
    ];
    for (const table of tables) {
      const exists = await queryRunner.hasTable(table);
      if (!exists) {
        console.log(`Warning: Table ${table} does not exist`);
      }
    }

    const userColumns = [
      { name: 'assigned_state_id', type: 'uuid' },
      { name: 'assigned_local_government_id', type: 'uuid' },
      { name: 'assigned_phase_id', type: 'uuid' },
      { name: 'assigned_district_id', type: 'uuid' },
    ];

    for (const column of userColumns) {
      const hasColumn = await queryRunner.hasColumn('users', column.name);
      if (!hasColumn) {
        try {
          await queryRunner.query(`
                        ALTER TABLE "users" 
                        ADD COLUMN "${column.name}" ${column.type} NULL
                    `);
          console.log(`Added column ${column.name} to users table`);
        } catch (error) {
          console.log(
            `Failed to add column ${column.name}:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
        }
      }
    }

    const foreignKeys = [
      {
        table: 'users',
        column: 'assigned_state_id',
        referencedTable: 'states',
        referencedColumn: 'id',
        constraintName: 'FK_users_assigned_state',
      },
      {
        table: 'users',
        column: 'assigned_local_government_id',
        referencedTable: 'local_governments',
        referencedColumn: 'id',
        constraintName: 'FK_users_assigned_lga',
      },
      {
        table: 'users',
        column: 'assigned_phase_id',
        referencedTable: 'phases',
        referencedColumn: 'id',
        constraintName: 'FK_users_assigned_phase',
      },
      {
        table: 'users',
        column: 'assigned_district_id',
        referencedTable: 'districts',
        referencedColumn: 'id',
        constraintName: 'FK_users_assigned_district',
      },
    ];

    for (const fk of foreignKeys) {
      try {
        const hasColumn = await queryRunner.hasColumn(fk.table, fk.column);
        const hasReferencedTable = await queryRunner.hasTable(
          fk.referencedTable,
        );

        if (hasColumn && hasReferencedTable) {
          await queryRunner.query(`
                        ALTER TABLE "${fk.table}" 
                        ADD CONSTRAINT "${fk.constraintName}" 
                        FOREIGN KEY ("${fk.column}") 
                        REFERENCES "${fk.referencedTable}"("${fk.referencedColumn}") 
                        ON DELETE SET NULL
                    `);
          console.log(`Added foreign key constraint ${fk.constraintName}`);
        }
      } catch (error) {
        console.log(
          `Foreign key ${fk.constraintName} already exists or failed to create:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const foreignKeys = [
      'FK_users_assigned_district',
      'FK_users_assigned_phase',
      'FK_users_assigned_lga',
      'FK_users_assigned_state',
    ];

    for (const fk of foreignKeys) {
      try {
        await queryRunner.query(
          `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "${fk}"`,
        );
      } catch (error) {
        console.log(
          `Failed to drop constraint ${fk}:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    const columns = [
      'assigned_district_id',
      'assigned_phase_id',
      'assigned_local_government_id',
      'assigned_state_id',
    ];

    for (const column of columns) {
      try {
        const hasColumn = await queryRunner.hasColumn('users', column);
        if (hasColumn) {
          await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN "${column}"`,
          );
        }
      } catch (error) {
        console.log(
          `Failed to drop column ${column}:`,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }
  }
}
