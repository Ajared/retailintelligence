import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreDto } from './dto/store.dto';
import { PaginationValidator } from '~/helpers/pagination.helper';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Body() storeDto: StoreDto) {
    return this.storeService.createStore(storeDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStoreById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listStores(@Query() paginationOptions: PaginationValidator) {
    return this.storeService.listStores(paginationOptions);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateStore(@Param('id') id: string, @Body() storeDto: StoreDto) {
    return this.storeService.updateStore(id, storeDto);
  }
}
