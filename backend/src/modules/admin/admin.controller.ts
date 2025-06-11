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
import { UserQueryValidator } from '../user/dto/user.dto';
import { StoreQueryValidator } from '../store/dto/store.dto';

@Controller('admin')
@UseGuards(RoleGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('users/deactivate')
  async deactivateUser(
    @Body() body: { userId: string },
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.userService.deactivateUser(body.userId, req.user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Post('users/reactivate')
  async reactivateUser(
    @Body() body: { userId: string },
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.userService.reactivateUser(body.userId, req.user.sub);
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
    return this.adminService.exportStores(response, queryOptions);
  }

  @Get('stores/:id')
  async getStoreById(@Param('id') id: string) {
    return this.adminService.getStoreById(id);
  }
}
