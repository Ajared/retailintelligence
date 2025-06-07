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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StoreService } from './store.service';
import { StoreDto, StoreQueryValidator } from './dto/store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(@Body() storeDto: StoreDto, @Req() req: Request) {
    const enumeratorId = req.user?.sub ?? '';
    return this.storeService.createStore(enumeratorId, storeDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStoreById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listStores(@Query() queryOptions: StoreQueryValidator) {
    return this.storeService.listStores(queryOptions);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateStore(@Param('id') id: string, @Body() storeDto: StoreDto) {
    return this.storeService.updateStore(id, storeDto);
  }
}
