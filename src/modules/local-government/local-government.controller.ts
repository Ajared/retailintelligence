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
import { SuperAdminGuard } from '~/guards/super-admin.guard';
import { LocalGovernmentDto } from './dto/local-government.dto';
import { PaginationOptions } from '~/helpers/pagination.helper';
import { LocalGovernmentService } from './local-government.service';

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
