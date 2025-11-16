import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { UserRole, UserStatus } from './constants/user.constant';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, User);
  }

  async findUnverifiedUsersInLast24Hours(
    twentyFourHoursAgo: Date,
  ): Promise<User[]> {
    return this.repository.find({
      where: {
        status: UserStatus.UNVERIFIED,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo),
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findAdmins(): Promise<User[]> {
    return this.repository.find({
      where: {
        role: In([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
      },
    });
  }

  async findUsersByIdsAndStatus(
    userIds: string[],
    status: UserStatus,
  ): Promise<User[]> {
    return this.repository.find({
      where: userIds.map((id) => ({
        id,
        status,
      })),
    });
  }
}
