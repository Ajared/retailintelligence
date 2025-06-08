import { QueryValidator } from '~/helpers/query.helper';
import { Request, Response } from 'express';
import { RoleGuard } from '~/guards/role.guard';
import { UserService } from '../user/user.service';
import { Roles } from '~/decorators/role.decorator';
import { StoreService } from '../store/store.service';
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
import { StoreQueryValidator } from '../store/dto/store.dto';
import { UserQueryValidator } from '../user/dto/user.dto';

@Controller('admin')
@UseGuards(RoleGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly storeService: StoreService,
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
    return this.storeService.listStores(queryOptions);
  }

  @Get('stores/export')
  async exportStores(
    @Res() response: Response,
    @Query() queryOptions: QueryValidator,
  ) {
    return this.storeService.exportStores(response, queryOptions);
  }

  @Get('stores/:id')
  async getStoreById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }
}
