import { HttpStatus, Logger } from "@nestjs/common";
import { Post as PrismaPost, Series as PrismaSeries, Topic as PrismaTopic, User as PrismaUser } from "@prisma/client";
import { SsshException } from "src/infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { iPost } from "./post.interface";
import { iSeries } from "../series/series.interface";
import { iTopic } from "../topic/topic.interface";
import { iUser } from "src/domain/user/domain/user.interface";
import { ReadPostDto } from "../../presentation/post/dto/read-post.dto";
import { User } from "src/domain/user/domain/user.entity";
import { Topic } from "../topic/topic.entity";
import { Series } from "../series/series.entity";

export type ofPost = PrismaPost & { author: PrismaUser, topic: PrismaTopic, series?: PrismaSeries };

export class Post implements iPost {
  private readonly logger = new Logger(Post.name);
  private _title: string;
  private _content: string;
  private _thumbnail?: string;
  private _author: iUser;
  private _topic: iTopic;
  private _series?: iSeries;

  constructor(
    private _id: number,
    _title: string,
    _content: string,
    _author: iUser,
    _topic: iTopic,
    _series?: iSeries,
    _thumbnail?: string,
    private _createdAt?: Date,
    private _updatedAt?: Date
  ) {
    this.title = _title;
    this.content = _content;
    this.thumbnail = _thumbnail;
    this.author = _author;
    this.topic = _topic;
    this.series = _series;
  }

  static of(post: ofPost) {
    return new this(
      post.id,
      post.title,
      post.content,
      User.of(post.author),
      Topic.of(post.topic),
      post.series ? Series.of(post.series) : null,
      post.thumbnail,
      post.createdAt,
      post.updatedAt
    )
  }

  /**
   * Getter
   */
  get id(): number { return this._id; }
  get title(): string { return this._title; }
  set title(title: string) {
    if (title.length > 50) {
      this.logger.error("제목 길이(50자) 초과 title -> " + title);
      throw new SsshException(ExceptionEnum.INVALID_PARAMETER, HttpStatus.BAD_REQUEST, { param: "title" });
    }

    this._title = title.replaceAll(" ", "_");
  }

  get content(): string { return this._content; }
  set content(content: string) {
    this._content = content;
  }

  get thumbnail(): string { return this._thumbnail; }
  set thumbnail(thumbnail: string) {
    this._thumbnail = thumbnail;
  }

  get author(): iUser { return this._author; }
  set author(author: iUser) {
    this._author = author;
  }

  get topic(): iTopic { return this._topic; }
  set topic(topic: iTopic) {
    this._topic = topic;
  }

  get series(): iSeries { return this._series; }
  set series(series: iSeries | undefined) {
    this._series = series;
  }

  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  toDto(): ReadPostDto {
    return {
      id: this._id,
      title: this._title,
      content: this._content,
      thumbnail: this._thumbnail,
      author: this._author.toDto(),
      topic: this._topic.toDto(),
      series: this._series ? this._series.toDto() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }
}
