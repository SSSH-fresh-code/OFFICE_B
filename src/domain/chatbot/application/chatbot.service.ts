import { Inject, Injectable } from '@nestjs/common';
import { MessengerFactory } from './../infrastructure/messenger.factory';
import { CHATBOT_REPOSITORY, CHAT_REPOSITORY, MESSENGER_FACTORY } from '../chatbot.const';
import { IChatBotRepository } from '../infrastructure/chatbot.repository';
import { CreateChatBotDto } from '../presentation/dto/create-chatbot.dto';
import { ChatBot, MessengerType } from '../domain/chatbot.entity';
import { UpdateChatBotDto } from '../presentation/dto/update-chatbot.dto';
import { ChatBotPagingDto } from '../presentation/dto/chatbot-paging.dto';
import { Page, PagingService } from '../../../infrastructure/common/services/paging.service';

@Injectable()
export class ChatBotService {
  constructor(
    @Inject(MESSENGER_FACTORY) private readonly messengerFactory: MessengerFactory,
    @Inject(CHATBOT_REPOSITORY) private readonly repostiroy: IChatBotRepository,
    private readonly pagingService: PagingService<ChatBot>,
  ) { }

  /**
   * 챗봇을 생성합니다.
   * @param {CreateChatBotDto} dto 
   * @returns 생성된 챗봇을 반환합니다.
   */
  async createChatBot({ botId, token, name, description, type }: CreateChatBotDto) {
    const bot = new ChatBot(0, botId, token, name, description, MessengerType[type]);

    bot.validate();

    return await this.repostiroy.createChatBot(bot);
  }

  /**
   * 챗봇을 수정합니다.
   * @param {UpdateChatBotDto} dto 
   * @returns 수정된 챗봇을 반환합니다.
   */
  async updateChatBot(dto: UpdateChatBotDto, chatIds?: number[]) {
    const bot = new ChatBot(dto.id, dto.botId, dto.token, dto.name, dto.description, MessengerType[dto.type]);

    bot.validate();

    return await this.repostiroy.updateChatBot(bot, chatIds);
  }

  /**
   * 챗봇을 삭제합니다.
   * @param {number} id 
   */
  async deleteChatBot(id: number) {
    await this.repostiroy.deleteChatBot(id);
  }

  /**
   * 아이디로 챗봇을 조회합니다.
   * @param {number} id 
   * @return {Promise<ChatBot>} 챗봇을 반환합니다.
   */
  async getChatBotById(id: number) {
    return await this.repostiroy.findChatBotById(id);
  }
  /**
   * 챗봇 리스트를 조회합니다.
   * @param {number} id 
   * @return {Promise<ChatBot>} 챗봇을 반환합니다.
   */
  async getChatBots(pagingDto: ChatBotPagingDto): Promise<Page<ChatBot>> {
    const where = {};
    if (pagingDto.where__type) {
      where['type'] = pagingDto.where__type;
    }
    const orderBy = {};
    if (pagingDto.orderby) {
      orderBy[pagingDto.orderby] = pagingDto.direction;
    }

    return this.pagingService.getPagedResults('ChatBot', pagingDto, where, orderBy);
  }
}