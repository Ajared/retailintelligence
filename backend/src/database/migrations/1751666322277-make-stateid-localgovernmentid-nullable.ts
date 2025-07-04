import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeStateidLocalgovernmentidNullable1751666322277
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'stores',
      'local_government_id',
      new TableColumn({
        name: 'local_government_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.changeColumn(
      'stores',
      'state_id',
      new TableColumn({
        name: 'state_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'stores',
      'local_government_id',
      new TableColumn({
        name: 'local_government_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
    await queryRunner.changeColumn(
      'stores',
      'state_id',
      new TableColumn({
        name: 'state_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
  }
}
