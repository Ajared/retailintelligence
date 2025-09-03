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
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StoreService } from './store.service';
import { SkipThrottle } from '@nestjs/throttler';
import { QueryValidator } from '~/helpers/query.helper';
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
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  async listStores(
    @Req() req: Request & { user: { sub: string } },
    @Query() queryOptions: StoreQueryValidator,
  ) {
    return this.storeService.listStores(req.user.sub, queryOptions);
  }

  @Get('export')
  async exportStores(
    @Res() response: Response,
    @Req() req: Request & { user: { sub: string } },
    @Query() queryOptions: QueryValidator,
  ) {
    await this.storeService.exportStores(response, queryOptions, req.user.sub);
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
