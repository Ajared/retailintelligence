import { StoreType } from '../constants/store.constant';
import { AbstractBaseInterface } from '~/database/base/base.interface';

export interface StoreInterface extends AbstractBaseInterface {
  storeName: string;
  localGovernmentId: string;
  districtId: string;
  address: string;
  storeType: StoreType;
  landmarks?: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  enumeratorId: string;
}
