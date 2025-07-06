import { QueryValidator } from '~/helpers/query.helper';
import { Request, Response } from 'express';
import { RoleGuard } from '~/guards/role.guard';
import { UserService } from '../user/user.service';
import { Roles } from '~/decorators/role.decorator';
import { UserRole } from '~/modules/user/constants/user.constant';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { StoreQueryValidator } from '../store/dto/store.dto';
import { AssignLocationDto, UserQueryValidator } from '../user/dto/user.dto';

@Controller('admin')
@UseGuards(RoleGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('users/:userId/assign-location')
  async assignLocation(
    @Param('userId') userId: string,
    @Body() assignLocationDto: AssignLocationDto,
  ) {
    return this.userService.assignLocationToUser(userId, assignLocationDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('users/:userId/deactivate')
  async deactivateUser(
    @Param('userId') userId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.userService.deactivateUser(userId, req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Post('users/:userId/reactivate')
  async reactivateUser(
    @Param('userId') userId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.userService.reactivateUser(userId, req.user.sub);
  }

  @Get('users')
  async getUsers(@Query() query: UserQueryValidator) {
    return this.userService.listUsers(query);
  }

  @Get('stores')
  async getStores(@Query() queryOptions: StoreQueryValidator) {
    return this.adminService.listStores(queryOptions);
  }

  @Get('stores/export')
  async exportStores(
    @Res() response: Response,
    @Query() queryOptions: QueryValidator,
  ) {
    await this.adminService.exportStores(response, queryOptions);
  }

  @Get('stores/:id')
  async getStoreById(@Param('id') id: string) {
    return this.adminService.getStoreById(id);
  }
}
