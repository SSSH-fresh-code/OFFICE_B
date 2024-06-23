import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ChatBotService } from '../application/chatbot.service';
import { PermissionsClass, PermissionsMethod } from '../../../infrastructure/decorator/permissions.decorator';
import { PermissionEnum } from '../../../domain/permission/domain/permission.enum';
import { CreateChatBotDto } from './dto/create-chatbot.dto';
import { ChatBot } from '../domain/chatbot.entity';
import { UpdateChatBotDto } from './dto/update-chatbot.dto';
import { ChatBotPagingDto } from './dto/chatbot-paging.dto';
import { Page } from 'src/infrastructure/common/services/paging.service';

@ApiTags('chats')
@Controller('chat/bot')
@PermissionsClass(PermissionEnum.CAN_USE_CHAT)
export class ChatBotController {
  constructor(private readonly chatbotService: ChatBotService) { }

  @Post()
  @ApiOperation({ summary: '신규 챗봇 생성' })
  @ApiResponse({
    status: 201,
    description: '챗봇이 정상적으로 생성 됨',
  })
  @ApiResponse({ status: 400, description: '잘못된 파라미터 값' })
  @ApiBody({ type: CreateChatBotDto })
  @PermissionsMethod(PermissionEnum.CAN_WRITE_CHAT)
  async createChatBot(@Body() dto: CreateChatBotDto): Promise<ChatBot> {
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
  async UpdateChatBotDto(@Body() dto: UpdateChatBotDto) {
    return await this.chatbotService.updateChatBot(dto);
  }

  @Get()
  @ApiOperation({ summary: '챗봇 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '챗봇 목록이 정상적으로 조회됨',
  })
  @PermissionsMethod(PermissionEnum.CAN_READ_CHAT)
  async getChatBots(@Query() pagingDto: ChatBotPagingDto): Promise<Page<ChatBot>> {
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
  async getChatBotById(@Param('id', ParseIntPipe) id: number): Promise<ChatBot> {
    return await this.chatbotService.getChatBotById(id);
  }

}