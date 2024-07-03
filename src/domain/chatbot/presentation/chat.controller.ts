
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PermissionsClass, PermissionsMethod } from '../../../infrastructure/decorator/permissions.decorator';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import { Page } from '../../../infrastructure/common/services/paging.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ChatService } from '../application/chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReadChatDto } from './dto/read-chat.dto';
import { ChatPagingDto } from './dto/chat-paging.dto';

@ApiTags('chats')
@Controller('chat')
@PermissionsClass(PermissionEnum.CAN_USE_CHAT)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) { }

  @Post()
  @ApiOperation({ summary: '신규 챗 생성' })
  @ApiResponse({
    status: 201,
    description: '챗이 정상적으로 생성 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: CreateChatDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async createChatBot(@Body() dto: CreateChatDto): Promise<ReadChatDto> {
    return await this.chatService.createChat(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '챗 삭제' })
  @ApiResponse({
    status: 200,
    description: '챗 단건 삭제',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 챗' })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async deleteChatBotById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.chatService.deleteChat(id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  @Get()
  @ApiOperation({ summary: '챗 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '챗 목록이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_CHAT)
  async getChatBots(@Query() pagingDto: ChatPagingDto): Promise<Page<ReadChatDto>> {
    return await this.chatService.getChatsByType(pagingDto);
  }
}
