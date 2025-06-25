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
import { RoleGuard } from '~/guards/role.guard';
import { Roles } from '~/decorators/role.decorator';
import { DistrictDto, DistrictQueryValidator } from './dto/district.dto';
import { UserRole } from '~/modules/user/constants/user.constant';
import { DistrictService } from './district.service';

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) {}

  @Post()
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createDistrict(@Body() districtDto: DistrictDto) {
    return this.districtService.createDistrict(districtDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDistrictById(@Param('id') id: string) {
    return this.districtService.getDistrictById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listDistricts(@Query() queryOptions: DistrictQueryValidator) {
    return this.districtService.listDistricts(queryOptions);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateDistrict(
    @Param('id') id: string,
    @Body() districtDto: DistrictDto,
  ) {
    return this.districtService.updateDistrict(id, districtDto);
  }
}
