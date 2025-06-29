import { UserInterface } from './user';
import { StateInterface } from './state';
import { PhaseInterface } from './phase';
import { AbstractBaseInterface } from './base';
import { DistrictInterface } from './district';
import { LocalGovernmentInterface } from './local-government';

export interface StoreInterface extends AbstractBaseInterface {
  name: string;
  state_id: string;
  state: StateInterface;
  local_government_id: string;
  local_government: LocalGovernmentInterface;
  phase_id?: string;
  phase?: PhaseInterface;
  district_id?: string;
  district?: DistrictInterface;
  address: string;
  store_type: string;
  landmarks?: string;
  photos?: string[];
  latitude: number;
  longitude: number;
  enumerator_id: string;
  enumerator: UserInterface;
}
