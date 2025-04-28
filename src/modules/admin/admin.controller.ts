import {
  PaginationOptions,
  ExportTypeValidator,
} from '~/helpers/pagination.helper';
import { Response } from 'express';
import { StoreService } from '../store/store.service';
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private readonly storeService: StoreService) {}

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
