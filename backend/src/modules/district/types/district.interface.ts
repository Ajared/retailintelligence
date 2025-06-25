import { AbstractBaseInterface } from '~/database/base/base.interface';

export interface DistrictInterface extends AbstractBaseInterface {
  name: string;
  phaseId: string;
}
