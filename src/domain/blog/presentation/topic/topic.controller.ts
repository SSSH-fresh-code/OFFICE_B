import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Logger} from 'winston';
import {WINSTON_MODULE_PROVIDER} from 'nest-winston';
import {
  PermissionsClass,
  PermissionsMethod,
} from 'src/infrastructure/decorator/permissions.decorator';
import {PermissionEnum} from 'src/domain/permission/domain/permission.enum';
import {TopicService} from '../../application/topic/topic.service';
import {CreateTopicDto} from './dto/create-topic.dto';
import {ReadTopicDto} from './dto/read-topic.dto';
import {PagingTopicDto} from './dto/paging-topic.dto';
import {Page} from 'src/infrastructure/common/services/paging.service';
import {UpdateTopicDto} from './dto/update-topic.dto';

@ApiTags('blog')
@Controller('topic')
@PermissionsClass(PermissionEnum.CAN_USE_BLOG)
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('all')
  @ApiOperation({summary: '주제 전체 조회(Select 컴포넌트용)'})
  @ApiResponse({
    status: 200,
    description: '주제들이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async getTopicForSelect(): Promise<Pick<ReadTopicDto, 'name' | 'id'>[]> {
    return await this.topicService.getTopicForSelect();
  }

  @Get(':name')
  @ApiOperation({summary: '주제 단건 조회'})
  @ApiResponse({
    status: 200,
    description: '주제가 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_BLOG)
  async getTopicByName(@Param('name') name: string): Promise<ReadTopicDto> {
    return await this.topicService.getTopicByName(name);
  }

  @Get()
  @ApiOperation({summary: '주제 다건 조회'})
  @ApiResponse({
    status: 200,
    description: '주제들이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_BLOG)
  async getTopics(@Query() dto: PagingTopicDto): Promise<Page<ReadTopicDto>> {
    return await this.topicService.getTopics(dto);
  }

  @Post()
  @ApiOperation({summary: '신규 주제 생성'})
  @ApiResponse({
    status: 201,
    description: '주제가 정상적으로 생성 됨',
  })
  @ApiResponse({status: 400, description: '잘못된 파라미터 값'})
  @ApiBody({type: CreateTopicDto})
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async createTopic(@Body() dto: CreateTopicDto): Promise<ReadTopicDto> {
    return await this.topicService.createTopic(dto);
  }

  @Put()
  @ApiOperation({summary: '주제 수정'})
  @ApiResponse({
    status: 201,
    description: '주제가 정상적으로 수정 됨',
  })
  @ApiResponse({status: 400, description: '잘못된 파라미터 값'})
  @ApiBody({type: UpdateTopicDto})
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async updateTopic(@Body() dto: UpdateTopicDto): Promise<ReadTopicDto> {
    return await this.topicService.updateTopic(dto);
  }

  @Delete(':id')
  @ApiOperation({summary: '주제 삭제'})
  @ApiResponse({
    status: 200,
    description: '주제 단건 삭제',
  })
  @ApiResponse({status: 404, description: '존재하지 않는 주제'})
  @PermissionsMethod(PermissionEnum.CAN_WRITE_BLOG)
  async deleteTopic(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.topicService.deleteTopic(id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
