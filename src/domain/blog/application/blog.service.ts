import {iBlogService} from './blog.service.interface';
import {HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {PostService} from './post/post.service';
import {UserInSession} from 'src/domain/user/infrastructure/auth';
import {MainPageDto} from '../presentation/dto/MainPageDto';
import {POST_SERVICE} from '../blog.const';
import {PermissionEnum} from '../../permission/domain/permission.enum';
import {PagingDto} from '../../../infrastructure/common/dto/paging.dto';
import {SsshException} from '../../../infrastructure/filter/exception/sssh.exception';
import {ExceptionEnum} from '../../../infrastructure/filter/exception/exception.enum';

@Injectable()
export class BlogService implements iBlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @Inject(POST_SERVICE) private readonly postService: PostService,
  ) {}

  async getMain({id, permissions}: UserInSession): Promise<MainPageDto> {
    const dto: MainPageDto = {
      favoritesMenu: [],
    };

    if (!permissions.includes(PermissionEnum.CAN_LOGIN)) {
      throw new SsshException(ExceptionEnum.FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const isSu = permissions.includes(PermissionEnum.SUPER_USER);

    let hasBlogPermission = isSu;

    if (!hasBlogPermission) {
      hasBlogPermission =
        permissions.includes(PermissionEnum.CAN_USE_BLOG) ||
        permissions.includes(PermissionEnum.CAN_READ_BLOG) ||
        permissions.includes(PermissionEnum.CAN_WRITE_BLOG);
    }

    if (hasBlogPermission) {
      const pagingDto: PagingDto = {
        page: 1,
        take: 5,
        orderby: 'createdAt',
        direction: 'desc',
      };
      try {
        dto.recentPosts = await this.postService.getPosts(pagingDto);
      } catch (e) {
        this.logger.error('getMain - getPosts Error');
        this.logger.debug(e);

        dto.recentPosts = {
          data: [],
          total: 0,
        };
      }
    }

    return dto;
  }
}
