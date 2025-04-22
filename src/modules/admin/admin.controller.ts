import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { StoreService } from '../store/store.service';

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private readonly storeService: StoreService) {}

  @Get('stores')
  async getStores(@Query() query: PaginationOptions) {
    return this.storeService.listStores(query);
  }
}
