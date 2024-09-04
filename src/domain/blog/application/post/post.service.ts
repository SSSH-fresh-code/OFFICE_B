import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import {
  POST_REPOSITORY,
  SERIES_REPOSITORY,
  TOPIC_REPOSITORY,
} from '../../blog.const';
import {
  Page,
  PagingService,
} from 'src/infrastructure/common/services/paging.service';
import {SeriesRepository} from '../../infrastructure/series/series.repository';
import {TopicRepository} from '../../infrastructure/topic/topic.repository';
import {iPostService} from './post.service.interface';
import {PostRepository} from '../../infrastructure/post/post.repository';
import {ReadPostDto} from '../../presentation/post/dto/read-post.dto';
import {PagingPostDto} from '../../presentation/post/dto/paging-post.dto';
import {CreatePostDto} from '../../presentation/post/dto/create-post.dto';
import {UpdatePostDto} from '../../presentation/post/dto/update-post.dto';
import {ofPost, Post} from '../../domain/post/post.entity';
import {Series} from '../../domain/series/series.entity';
import {User} from 'src/domain/user/domain/user.entity';
import {Topic} from '../../domain/topic/topic.entity';
import {SsshException} from 'src/infrastructure/filter/exception/sssh.exception';
import {ExceptionEnum} from 'src/infrastructure/filter/exception/exception.enum';
import {USER_REPOSITORY} from 'src/domain/user/user.const';
import {UserRepository} from 'src/domain/user/infrastructure/user.repository';

@Injectable()
export class PostService implements iPostService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(TOPIC_REPOSITORY) private readonly topicRepository: TopicRepository,
    @Inject(SERIES_REPOSITORY)
    private readonly seriesRepository: SeriesRepository,
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
    private readonly pagingService: PagingService<ofPost>,
  ) {}

  async getPostById(id: number): Promise<ReadPostDto> {
    const entity = await this.postRepository.findById(id);

    return entity.toDto();
  }

  async getPostByTitle(title: string): Promise<ReadPostDto> {
    if (title.indexOf(' ') > 0) {
      title = title.replaceAll(' ', '_');
    }

    const entity = await this.postRepository.findByTitle(title);

    return entity.toDto();
  }

  async getPosts(dto: PagingPostDto): Promise<Page<ReadPostDto>> {
    const posts = await this.pagingService.getPagedResults('Post', dto);

    const readPosts = posts.data.map((pp) => Post.of(pp).toDto());

    return {
      data: readPosts,
      info: posts.info,
    };
  }

  async createPost(dto: CreatePostDto): Promise<ReadPostDto> {
    const user = new User('', '', '', dto.authorName);
    const topic = new Topic(dto.topicId, '');
    const series = dto.seriesId ? new Series(dto.seriesId, '', topic) : null;

    const post = new Post(
      0,
      dto.title,
      dto.content,
      user,
      topic,
      series,
      dto.thumbnail,
    );

    const entity = await this.postRepository.save(post);

    return entity.toDto();
  }

  async updatePost(dto: UpdatePostDto): Promise<ReadPostDto> {
    let isUpdated = false;

    const post = await this.postRepository.findById(dto.id);

    if (dto.title && post.title !== dto.title) {
      post.title = dto.title;
      isUpdated = true;
    }

    if (dto.content && post.content !== dto.content) {
      post.content = dto.content;
      isUpdated = true;
    }

    if (dto.thumbnail && post.thumbnail !== dto.thumbnail) {
      post.thumbnail = dto.thumbnail;
      isUpdated = true;
    }

    if (dto.authorName && post.author.name !== dto.authorName) {
      const userForUpdate = await this.userRepository.findByName(
        dto.authorName,
      );

      post.author = userForUpdate;
      isUpdated = true;
    }

    if (dto.topicId && post.topic.id !== dto.topicId) {
      const topicForUpdate = await this.topicRepository.findById(dto.topicId);

      post.topic = topicForUpdate;
      isUpdated = true;
    }

    if (
      (dto.seriesId && !post.series) || // 추가
      (dto.seriesId === null && post.series) || // 삭제(seriesId가 null로 들어와야함)
      (dto.seriesId && post.series && dto.seriesId !== post.series.id) // 변경
    ) {
      if (!dto.seriesId && post.series) {
        // 삭제인 경우
        post.series = null;
      } else {
        const seriesForUpdate = await this.seriesRepository.findById(
          dto.seriesId,
        );

        post.series = seriesForUpdate;
      }

      isUpdated = true;
    }

    if (isUpdated) {
      const updatedPost = await this.postRepository.update(post);

      return updatedPost.toDto();
    } else {
      throw new SsshException(
        ExceptionEnum.NOT_MODIFIED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deletePost(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }
}
