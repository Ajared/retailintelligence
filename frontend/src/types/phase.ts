import type { DistrictInterface } from './district';
import type { AbstractBaseInterface } from './base';

export interface PhaseInterface extends AbstractBaseInterface {
  name: string;
  state_id: string;
  districts: DistrictInterface[];
}
