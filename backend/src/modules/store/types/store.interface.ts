import { AbstractBaseInterface } from '~/database/base/base.interface';

export type StoreType =
  | 'SHOP'
  | 'REFUSE_SITE'
  | 'SCHOOL'
  | 'HOSPITAL'
  | 'BAR_RESTAURANT'
  | 'FUELING_STATION'
  | 'HOTEL'
  | 'RECREATION_PARK'
  | 'FINANCIAL_INSTITUTION'
  | 'RELIGIOUS'
  | 'OTHER';

export interface StoreInterface extends AbstractBaseInterface {
  name: string;
  localGovernmentId?: string;
  stateId?: string;
  address: string;
  storeType: StoreType;
  storeTypeDescription?: string;
  landmarks?: string;
  photos?: string[];
  latitude: number;
  longitude: number;
  enumeratorId: string;
  phaseId?: string;
  districtId?: string;
}
