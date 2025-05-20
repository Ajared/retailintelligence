import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { trySafe } from '~/helpers/try-safe';
import { User } from '~/modules/user/entities/user.entity';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserRole } from '~/modules/user/constants/user.constant';
export class AppSeeder implements Seeder {
  public async run(
    datasource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const logger = new Logger('Seeder');
    const userRepository = datasource.getRepository(User);

    const [error] = await trySafe(async () => {
      await datasource.transaction(async () => {
        if (
          !(await userRepository.findOne({
            where: { role: UserRole.SUPER_ADMIN },
          }))
        ) {
          await factoryManager.get(User).save();
          logger.log(`Super Admin successfully seeded`);
        } else {
          logger.log(`Super Admin already exists`);
        }
      });
      return true;
    });

    if (error) {
      logger.error('AppSeeder failed:', error);
      throw error;
    }
  }
}
