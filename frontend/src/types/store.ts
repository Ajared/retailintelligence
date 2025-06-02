import { AbstractBaseInterface } from './base';

export interface StoreInterface extends AbstractBaseInterface {
  storeName: string;
  stateId: string;
  localGovernmentId: string;
  address: string;
  storeType: string;
  landmarks?: string;
  photos?: string[];
  latitude: number;
  longitude: number;
  enumeratorId: string;
}
