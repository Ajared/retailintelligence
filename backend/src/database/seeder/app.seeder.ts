import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { trySafe } from '~/helpers/try-safe';
import { statesWithLGA } from './factories/data';
import { User } from '~/modules/user/entities/user.entity';
import { State } from '~/modules/state/entities/state.entity';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserRole } from '~/modules/user/constants/user.constant';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

export class AppSeeder implements Seeder {
  public async run(
    datasource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const logger = new Logger('Seeder');
    const userRepository = datasource.getRepository(User);
    const stateRepository = datasource.getRepository(State);
    const lgaRepository = datasource.getRepository(LocalGovernment);

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

        const stateCount = await stateRepository.count();
        if (stateCount === 0) {
          const states = Object.keys(statesWithLGA).map((stateName) => {
            const state = new State();
            state.name = stateName;
            return state;
          });

          const savedStates = await stateRepository.save(states);

          const allLgas = [];
          for (const savedState of savedStates) {
            const lgaNames =
              statesWithLGA[savedState.name as keyof typeof statesWithLGA];
            const lgas = lgaNames.map((lgaName: string) => {
              const lga = new LocalGovernment();
              lga.name = lgaName;
              lga.stateId = savedState.id;
              return lga;
            });
            allLgas.push(...lgas);
          }

          await lgaRepository.save(allLgas);

          logger.log(`Locations successfully seeded`);
        } else {
          logger.log(`Locations already exist`);
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
