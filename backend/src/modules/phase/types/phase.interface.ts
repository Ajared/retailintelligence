import { AbstractBaseInterface } from '~/database/base/base.interface';
import { DistrictInterface } from '~/modules/district/types/district.interface';

export interface PhaseInterface extends AbstractBaseInterface {
  name: string;
  districts?: DistrictInterface[];
}
