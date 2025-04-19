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
import { LocalGovernmentService } from './local-government.service';
import { LocalGovernmentDto } from './dto/local-government.dto';
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { PaginationOptions } from '~/helpers/pagination.helper';

@Controller('local-governments')
export class LocalGovernmentController {
  constructor(
    private readonly localGovernmentService: LocalGovernmentService,
  ) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createLocalGovernment(@Body() localGovernmentDto: LocalGovernmentDto) {
    return this.localGovernmentService.createLocalGovernment(
      localGovernmentDto,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SuperAdminGuard)
  async getLocalGovernmentById(@Param('id') id: string) {
    return this.localGovernmentService.getLocalGovernmentById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listLocalGovernments(@Query() paginationOptions: PaginationOptions) {
    return this.localGovernmentService.listLocalGovernments(paginationOptions);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
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
