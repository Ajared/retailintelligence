import { UserInterface } from './user';
import { StateInterface } from './state';
import { AbstractBaseInterface } from './base';
import { LocalGovernmentInterface } from './local-government';

export interface StoreInterface extends AbstractBaseInterface {
  name: string;
  state_id: string;
  state: StateInterface;
  local_government_id: string;
  local_government: LocalGovernmentInterface;
  address: string;
  store_type: string;
  landmarks?: string;
  photos?: string[];
  latitude: number;
  longitude: number;
  enumerator_id: string;
  enumerator: UserInterface;
}
