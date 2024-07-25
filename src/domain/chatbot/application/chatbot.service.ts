import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MessengerFactory } from './../infrastructure/messenger.factory';
import { CHATBOT_REPOSITORY, CHAT_REPOSITORY, MESSENGER_FACTORY } from '../chatbot.const';
import { IChatBotRepository } from '../infrastructure/chatbot.repository';
import { CreateChatBotDto } from '../presentation/dto/create-chatbot.dto';
import { ChatBot, MessengerType } from '../domain/chatbot.entity';
import { ChatBot as PrismaChatBot } from '@prisma/client';
import { UpdateChatBotDto } from '../presentation/dto/update-chatbot.dto';
import { ChatBotPagingDto } from '../presentation/dto/chatbot-paging.dto';
import { Page, PagingService } from '../../../infrastructure/common/services/paging.service';
import { ReadChatBotDto } from '../presentation/dto/read-chatbot.dto';
import { SendChatBotDto } from '../presentation/dto/send-chatbot.dto';
import { SendResultDto } from '../presentation/dto/send-result.dto';
import { SsshException } from '../../../infrastructure/filter/exception/sssh.exception';
import { ExceptionEnum } from '../../../infrastructure/filter/exception/exception.enum';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ChatBotService {
  constructor(
    @Inject(MESSENGER_FACTORY) private readonly messengerFactory: MessengerFactory,
    @Inject(CHATBOT_REPOSITORY) private readonly chatBotRepository: IChatBotRepository,
    private readonly pagingService: PagingService<PrismaChatBot>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) { }

  /**
   * 챗봇을 생성합니다.
   * @param {CreateChatBotDto} dto 
   * @returns 생성된 챗봇을 반환합니다.
   */
  async createChatBot({ botId, token, name, description, type }: CreateChatBotDto) {
    const bot = new ChatBot(0, botId, token, name, description, MessengerType[type]);

    bot.validate();

    const createdBot = await this.chatBotRepository.createChatBot(bot);

    return createdBot.toDto();
  }

  /**
   * 챗봇을 수정합니다.
   * @param {UpdateChatBotDto} dto 
   * @returns 수정된 챗봇을 반환합니다.
   */
  async updateChatBot(dto: UpdateChatBotDto) {
    const bot = new ChatBot(dto.id, dto.botId, dto.token, dto.name, dto.description, MessengerType[dto.type]);

    bot.validate();

    const updatedBot = await this.chatBotRepository.updateChatBot(bot, dto.chatIds);

    return updatedBot.toDto();
  }

  /**
   * 챗봇을 삭제합니다.
   * @param {number} id 
   */
  async deleteChatBot(id: number) {
    await this.chatBotRepository.deleteChatBot(id);
  }

  /**
   * 아이디로 챗봇을 조회합니다.
   * @param {number} id 
   * @return {Promise<ReadChatBotDto>} 챗봇을 반환합니다.
   */
  async getChatBotById(id: number) {
    const bot = await this.chatBotRepository.findChatBotById(id);

    return bot.toDto();
  }
  /**
   * 챗봇 리스트를 조회합니다.
   * @param {ChatBotPagingDto} pagingDto 
   * @return {Promise<ChatBot>} 챗봇을 반환합니다.
   */
  async getChatBots(pagingDto: ChatBotPagingDto): Promise<Page<ReadChatBotDto>> {
    const where = {};
    if (pagingDto.where__type) {
      where['where__type'] = pagingDto.where__type;
    }
    const orderBy = {};
    if (pagingDto.orderby) {
      orderBy[pagingDto.orderby] = pagingDto.direction;
    }

    const pagingBots = await this.pagingService.getPagedResults('ChatBot', pagingDto, where);

    return {
      data: pagingBots.data.map(bot => ChatBot.of(bot).toDto()),
      total: pagingBots.total
    }
  }

  /**
   * 챗봇으로 메세지를 전송합니다.
   * @param {SendChatBotDto} dto 
   * @returns {Promise<SendResultDto>}
   */
  async sendMessage(dto: SendChatBotDto): Promise<SendResultDto> {
    const bot = await this.chatBotRepository.findChatBotById(dto.botId);

    const chat = bot.chats.find(c => c.id === dto.chatId);

    if (!chat)
      throw new SsshException(ExceptionEnum.PARAMETER_NOT_FOUND, HttpStatus.BAD_REQUEST, { param: "chat" });

    let isSuccess = false;

    const messengerService = this.messengerFactory.getMessengerService(bot.type);

    try {
      await messengerService.chat(bot, chat, dto.message);

      isSuccess = true;
    } catch (e) {
      this.logger.error(e);
      isSuccess = false;
    }

    return {
      isSuccess,
      message: dto.message,
      chatbot: bot.toDto(),
      chat: chat.toDto()
    }
  }
}
