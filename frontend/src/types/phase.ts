import type { AbstractBaseInterface } from './base';
import type { District } from './district';

export interface Phase extends AbstractBaseInterface {
  name: string;
  state_id: string;
  districts: District[];
}
