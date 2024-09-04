import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import {CHAT_REPOSITORY} from '../chatbot.const';
import {MessengerType} from '../domain/chatbot.entity';
import {
  Page,
  PagingService,
} from '../../../infrastructure/common/services/paging.service';
import {CreateChatDto} from '../presentation/dto/create-chat.dto';
import {IChatRepository} from '../infrastructure/chat.repository';
import {ReadChatDto} from '../presentation/dto/read-chat.dto';
import {Chat} from '../domain/chat.entity';
import {ChatPagingDto} from '../presentation/dto/chat-paging.dto';
import {SsshException} from '../../../infrastructure/filter/exception/sssh.exception';
import {ExceptionEnum} from '../../../infrastructure/filter/exception/exception.enum';
import {Chat as PrismaChat} from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly repostiroy: IChatRepository,
    private readonly pagingService: PagingService<PrismaChat>,
  ) {}

  /**
   * 채팅을 생성합니다.
   * @param {CreateChatDto} dto
   * @returns {Promise<ReadChatDto>} ReadChatDto
   */
  async createChat(dto: CreateChatDto): Promise<ReadChatDto> {
    const chat = new Chat(0, dto.chatId, dto.name, MessengerType[dto.type]);

    chat.validate();

    const createdChat = await this.repostiroy.createChat(chat);

    return createdChat.toDto();
  }

  /**
   * 채팅을 삭제합니다.
   * @param {number} id
   */
  async deleteChat(id: number): Promise<void> {
    await this.repostiroy.deleteChat(id);
  }

  /**
   * 타입으로 채팅을 조회합니다.
   * @param {ChatPagingDto} dto
   * @returns {Promise<Page<ReadChatDto>>}
   */
  async getChatsByType(dto: ChatPagingDto): Promise<Page<ReadChatDto>> {
    /** type이 존재하지 않는 경우 조회하지 않음 */
    if (!dto.where__type) {
      throw new SsshException(
        ExceptionEnum.PARAMETER_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
        {param: 'type'},
      );
    }

    const where = {};

    if (dto.where__type) {
      where['type'] = dto.where__type;
    }

    const orderBy = {};

    if (dto.orderby) orderBy[dto.orderby] = dto.direction;

    const pagingChats = await this.pagingService.getPagedResults(
      'Chat',
      dto,
      where,
    );

    return {
      data: pagingChats.data.map((chat) => Chat.of(chat).toDto()),
      info: pagingChats.info,
    };
  }
}
