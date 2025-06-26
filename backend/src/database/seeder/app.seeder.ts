import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { trySafe } from '~/helpers/try-safe';
import { User } from '~/modules/user/entities/user.entity';
import { State } from '~/modules/state/entities/state.entity';
import { Phase } from '~/modules/phase/entities/phase.entity';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserRole } from '~/modules/user/constants/user.constant';
import { statesWithLGA, phasesWithDistricts } from './factories/data';
import { District } from '~/modules/district/entities/district.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

export class AppSeeder implements Seeder {
  public async run(
    datasource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const logger = new Logger('Seeder');
    const userRepository = datasource.getRepository(User);
    const stateRepository = datasource.getRepository(State);
    const phaseRepository = datasource.getRepository(Phase);
    const districtRepository = datasource.getRepository(District);
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

        const phaseCount = await phaseRepository.count();
        if (phaseCount === 0) {
          const abuja = await stateRepository.findOne({
            where: { name: 'FCT Abuja' },
          });
          if (!abuja) {
            throw new Error('FCT Abuja not found');
          }
          const phases = Object.keys(phasesWithDistricts).map((phaseName) => {
            const phase = new Phase();
            phase.stateId = abuja.id;
            phase.name = phaseName;
            return phase;
          });
          const savedPhases = await phaseRepository.save(phases);

          const allDistricts = [];
          for (const savedPhase of savedPhases) {
            const districtNames =
              phasesWithDistricts[
                savedPhase.name as keyof typeof phasesWithDistricts
              ];
            const districts = districtNames.map((districtName: string) => {
              const district = new District();
              district.name = districtName;
              district.phaseId = savedPhase.id;
              return district;
            });
            allDistricts.push(...districts);
          }

          await districtRepository.save(allDistricts);

          logger.log(`Phases and Districts successfully seeded`);
        } else {
          logger.log(`Phases and Districts already exist`);
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
