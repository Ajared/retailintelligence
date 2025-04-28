import { Entity, OneToMany, Column } from 'typeorm';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';

@Entity({ name: 'local_governments' })
export class LocalGovernment extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Store, (store) => store.localGovernment)
  stores: Store[];
}
