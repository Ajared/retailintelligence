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
import { LocalGovernmentDto } from './dto/local-government.dto';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { UserRole } from '~/modules/user/constants/user.constant';
import { LocalGovernmentService } from './local-government.service';

@Controller('local-governments')
export class LocalGovernmentController {
  constructor(
    private readonly localGovernmentService: LocalGovernmentService,
  ) {}

  @Post()
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createLocalGovernment(@Body() localGovernmentDto: LocalGovernmentDto) {
    return this.localGovernmentService.createLocalGovernment(
      localGovernmentDto,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLocalGovernmentById(@Param('id') id: string) {
    return this.localGovernmentService.getLocalGovernmentById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listLocalGovernments(@Query() paginationOptions: PaginationOptions) {
    return this.localGovernmentService.listLocalGovernments(paginationOptions);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateLocalGovernment(
    @Param('id') id: string,
    @Body() localGovernmentDto: LocalGovernmentDto,
  ) {
    return this.localGovernmentService.updateLocalGovernment(
      id,
      localGovernmentDto,
    );
  }
}
