import { AbstractBaseInterface } from './base';
import { LocalGovernmentInterface } from './local-government';

export interface StateInterface extends AbstractBaseInterface {
  name: string;
  local_governments: LocalGovernmentInterface[];
}
