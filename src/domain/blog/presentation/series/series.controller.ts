
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PermissionsClass, PermissionsMethod } from 'src/infrastructure/decorator/permissions.decorator';
import { PermissionEnum } from 'src/domain/permission/domain/permission.enum';
import { Page } from 'src/infrastructure/common/services/paging.service';
import { iSeriesService } from '../../application/series/series.service.interface';
import { SERIES_SERVICE } from '../../blog.const';
import { ReadSeriesDto } from './dto/read-series.dto';
import { PagingSeriesDto } from './dto/paging-series.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@ApiTags('blog')
@Controller('series')
@PermissionsClass(PermissionEnum.CAN_USE_BLOG)
export class SeriesController {
  constructor(
    @Inject(SERIES_SERVICE) private readonly seriesService: iSeriesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) { }

  @Get(':name')
  @ApiOperation({ summary: '시리즈 단건 조회' })
  @ApiResponse({
    status: 200,
    description: '시리즈가 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_BLOG)
  async getSeriesByName(@Param('name') name: string): Promise<ReadSeriesDto> {
    return await this.seriesService.getSeriesByName(name);
  }

  @Get()
  @ApiOperation({ summary: '시리즈 다건 조회' })
  @ApiResponse({
    status: 200,
    description: '시리즈들이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_BLOG)
  async getSeriess(@Query() dto: PagingSeriesDto): Promise<Page<ReadSeriesDto>> {
    dto.where__topicId = Number(dto.where__topicId);
    return await this.seriesService.getSeries(dto);
  }

  @Post()
  @ApiOperation({ summary: '신규 시리즈 생성' })
  @ApiResponse({
    status: 201,
    description: '시리즈가 정상적으로 생성 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: CreateSeriesDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async createSeries(@Body() dto: CreateSeriesDto): Promise<ReadSeriesDto> {
    return await this.seriesService.createSeries(dto);
  }

  @Put()
  @ApiOperation({ summary: '시리즈 수정' })
  @ApiResponse({
    status: 201,
    description: '시리즈가 정상적으로 수정 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: UpdateSeriesDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async updateSeries(@Body() dto: UpdateSeriesDto): Promise<ReadSeriesDto> {
    return await this.seriesService.updateSeries(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '시리즈 삭제' })
  @ApiResponse({
    status: 200,
    description: '시리즈 단건 삭제',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 시리즈' })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async deleteSeries(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.seriesService.deleteSeries(id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

}
