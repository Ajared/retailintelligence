import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DistrictService } from './district.service';
import { DistrictDto } from './dto/district.dto';
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { PaginationOptions } from '~/helpers/pagination.helper';

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDistrict(@Body() districtDto: DistrictDto) {
    return this.districtService.createDistrict(districtDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SuperAdminGuard)
  async getDistrictById(@Param('id') id: string) {
    return this.districtService.getDistrictById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listDistricts(@Query() paginationOptions: PaginationOptions) {
    return this.districtService.listDistricts(paginationOptions);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  async updateDistrict(
    @Param('id') id: string,
    @Body() districtDto: DistrictDto,
  ) {
    return this.districtService.updateDistrict(id, districtDto);
  }
}
