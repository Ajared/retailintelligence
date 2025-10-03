import { Store } from '~/modules/store/entities/store.entity';
import { State } from '~/modules/state/entities/state.entity';
import { Phase } from '~/modules/phase/entities/phase.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';
import { District } from '~/modules/district/entities/district.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole, UserStatus } from '~/modules/user/constants/user.constant';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.UNVERIFIED,
  })
  status: UserStatus;

  @Column({ nullable: true })
  deactivatedAt?: Date | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  assignedStateId?: string;

  @JoinColumn({ name: 'assigned_state_id' })
  @ManyToOne(() => State, (state) => state.users, { nullable: true })
  assignedState?: State;

  @Column({ nullable: true })
  assignedLocalGovernmentId?: string;

  @JoinColumn({ name: 'assigned_local_government_id' })
  @ManyToOne(
    () => LocalGovernment,
    (localGovernment) => localGovernment.users,
    { nullable: true },
  )
  assignedLocalGovernment?: LocalGovernment;

  @Column({ nullable: true })
  assignedPhaseId?: string;

  @JoinColumn({ name: 'assigned_phase_id' })
  @ManyToOne(() => Phase, (phase) => phase.users, { nullable: true })
  assignedPhase?: Phase;

  @Column({ nullable: true })
  assignedDistrictId?: string;

  @JoinColumn({ name: 'assigned_district_id' })
  @ManyToOne(() => District, (district) => district.users, { nullable: true })
  assignedDistrict?: District;

  @OneToMany(() => Store, (store) => store.enumerator)
  stores: Store[];
}
