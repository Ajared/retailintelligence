import { Entity, OneToMany, Column } from 'typeorm';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';

@Entity({ name: 'districts' })
export class District extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Store, (store) => store.district)
  stores: Store[];
}
