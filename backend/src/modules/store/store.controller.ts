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
  async createStore(
    @Body() storeDto: Omit<StoreDto, 'enumeratorId'>,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.storeService.createStore(req.user.sub, storeDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStoreById(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.storeService.getStoreById(id, req.user.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listStores(
    @Req() req: Request & { user: { sub: string } },
    @Query() queryOptions: StoreQueryValidator,
  ) {
    return this.storeService.listStores(req.user.sub, queryOptions);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateStore(
    @Param('id') id: string,
    @Body() storeDto: Partial<StoreDto>,
    @Req() req: Request & { user: { sub: string } },
  ) {
    return this.storeService.updateStore(id, req.user.sub, storeDto);
  }
}
