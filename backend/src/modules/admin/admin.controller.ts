import {
  PaginationOptions,
  ExportTypeValidator,
} from '~/helpers/pagination.helper';
import { Response } from 'express';
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
  Res,
  UseGuards,
} from '@nestjs/common';

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
  async deactivateUser(@Body() body: { userId: string }) {
    return this.userService.deactivateUser(body.userId);
  }

  @Get('stores')
  async getStores(@Query() query: PaginationOptions) {
    return this.storeService.listStores(query);
  }

  @Get('stores/export')
  async exportStores(
    @Res() response: Response,
    @Query() paginationOptions: PaginationOptions,
    @Query() exportTypeOptions: ExportTypeValidator,
  ) {
    return this.storeService.exportStores(
      response,
      paginationOptions,
      exportTypeOptions.type,
    );
  }

  @Get('stores/:id')
  async getStoreById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }
}
