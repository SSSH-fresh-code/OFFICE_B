import {ReadPostDto} from '../../presentation/post/dto/read-post.dto';
import {iSeries} from '../series/series.interface';
import {iTopic} from '../topic/topic.interface';
import {iUser} from 'src/domain/user/domain/user.interface';

export interface iPost {
  /**
   * 게시글 id를 반환합니다.
   */
  get id(): number;

  /**
   * 게시글 제목을 반환합니다.
   */
  get title(): string;

  /**
   * 게시글 제목을 설정합니다.
   * @param {string} title
   */
  set title(title: string);

  /**
   * 게시글 내용을 반환합니다.
   */
  get content(): string;

  /**
   * 게시글 내용을 설정합니다.
   * @param {string} content
   */
  set content(content: string);

  /**
   * 게시글 썸네일을 반환합니다.
   */
  get thumbnail(): string;

  /**
   * 게시글 썸네일을 설정합니다.
   * @param {string} thumbnail
   */
  set thumbnail(thumbnail: string);

  /**
   * 게시글 작성자를 반환합니다.
   */
  get author(): iUser;

  /**
   * 게시글 작성자을 설정합니다.
   * @param {iUser} author
   */
  set author(author: iUser);

  /**
   * 게시글 주제를 반환합니다.
   */
  get topic(): iTopic;
  /**
   * 게시글 topic을 설정합니다.
   * @param {iTopic} topic
   */
  set topic(topic: iTopic);

  /**
   * 게시글 시리즈를 반환합니다.
   */
  get series(): iSeries;
  /**
   * 게시글 Series을 설정합니다.
   * @param {iSeries} series
   */
  set series(series: iSeries);

  /**
   * 생성일을 반환합니다.
   */
  get createdAt(): Date;

  /**
   * 수정일을 반환합니다.
   */
  get updatedAt(): Date;

  /**
   * dto로 변환합니다.
   */
  toDto(): ReadPostDto;
}
