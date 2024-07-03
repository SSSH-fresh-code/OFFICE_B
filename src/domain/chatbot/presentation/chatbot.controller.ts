import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ChatBotService } from '../application/chatbot.service';
import { PermissionsClass, PermissionsMethod } from '../../../infrastructure/decorator/permissions.decorator';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import { CreateChatBotDto } from './dto/create-chatbot.dto';
import { UpdateChatBotDto } from './dto/update-chatbot.dto';
import { ChatBotPagingDto } from './dto/chatbot-paging.dto';
import { Page } from '../../../infrastructure/common/services/paging.service';
import { ReadChatBotDto } from './dto/read-chatbot.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { SendChatBotDto } from './dto/send-chatbot.dto';
import { SendResultDto } from './dto/send-result.dto';

@ApiTags('chats')
@Controller('chat/bot')
@PermissionsClass(PermissionEnum.CAN_USE_CHAT)
export class ChatBotController {
  constructor(
    private readonly chatbotService: ChatBotService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) { }

  @Post()
  @ApiOperation({ summary: '신규 챗봇 생성' })
  @ApiResponse({
    status: 201,
    description: '챗봇이 정상적으로 생성 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: CreateChatBotDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async createChatBot(@Body() dto: CreateChatBotDto): Promise<ReadChatBotDto> {
    return await this.chatbotService.createChatBot(dto);
  }

  @Put('')
  @ApiOperation({ summary: '챗봇 수정' })
  @ApiResponse({
    status: 200,
    description: '챗봇이 정상적으로 수정됨'
  })
  @ApiResponse({ status: 400, description: '존재하지 않는 챗봇' })
  @ApiBody({ type: UpdateChatBotDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async UpdateChatBotDto(@Body() dto: UpdateChatBotDto): Promise<ReadChatBotDto> {
    return await this.chatbotService.updateChatBot(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '챗봇 삭제' })
  @ApiResponse({
    status: 200,
    description: '챗봇 단건 삭제',
  })

  @ApiResponse({ status: 404, description: '존재하지 않는 챗봇' })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async deleteChatBotById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.chatbotService.deleteChatBot(id);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  @Get()
  @ApiOperation({ summary: '챗봇 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '챗봇 목록이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_CHAT)
  async getChatBots(@Query() pagingDto: ChatBotPagingDto): Promise<Page<ReadChatBotDto>> {
    return await this.chatbotService.getChatBots(pagingDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '챗봇 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '챗봇 정보가 정상적으로 조회됨',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 챗봇' })
  @PermissionsMethod(PermissionEnum.CAN_READ_CHAT)
  async getChatBotById(@Param('id', ParseIntPipe) id: number): Promise<ReadChatBotDto> {
    return await this.chatbotService.getChatBotById(id);
  }

  @Post('send')
  @ApiOperation({ summary: '챗봇 메세지 전송' })
  @ApiResponse({
    status: 200,
    description: '메세지가 정상적으로 전송되었습니다.',
  })
  @ApiBody({ type: SendChatBotDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async sendMessage(@Body() dto: SendChatBotDto): Promise<SendResultDto> {
    return await this.chatbotService.sendMessage(dto);
  }

}
