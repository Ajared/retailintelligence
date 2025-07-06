import { AbstractBaseInterface } from '~/database/base/base.interface';
import { LocalGovernmentInterface } from '~/modules/local-government/types/local-government.interface';
import { PhaseInterface } from '~/modules/phase/types/phase.interface';

export interface StateInterface extends AbstractBaseInterface {
  name: string;
  localGovernments?: LocalGovernmentInterface[];
  phases?: PhaseInterface[];
}
