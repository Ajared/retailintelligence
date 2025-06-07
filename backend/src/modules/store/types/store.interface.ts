import { AbstractBaseInterface } from '~/database/base/base.interface';

export interface StoreInterface extends AbstractBaseInterface {
  name: string;
  localGovernmentId: string;
  stateId: string;
  address: string;
  storeType: string;
  landmarks?: string;
  photos?: string[];
  latitude: number;
  longitude: number;
  enumeratorId: string;
}
