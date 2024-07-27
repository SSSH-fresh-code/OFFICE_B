import {HttpStatus, Logger} from '@nestjs/common';
import {Series as PrismaSeries} from '@prisma/client';
import {SsshException} from 'src/infrastructure/filter/exception/sssh.exception';
import {ExceptionEnum} from 'src/infrastructure/filter/exception/exception.enum';
import {iSeries} from './series.interface';
import {ReadSeriesDto} from '../../presentation/series/dto/read-series.dto';
import {iTopic} from '../topic/topic.interface';

export class Series implements iSeries {
  private readonly logger = new Logger(Series.name);
  private _name: string;
  private _topic: iTopic;

  constructor(
    private _id: number,
    _name: string,
    _topic: iTopic,
    private _createdAt?: Date,
    private _updatedAt?: Date,
  ) {
    this.name = _name;
    this.topic = _topic;
  }

  static of(series: PrismaSeries, topic?: iTopic) {
    return new this(
      series.id,
      series.name,
      topic,
      series.createdAt,
      series.updatedAt,
    );
  }

  /**
   * Getter
   */
  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    if (name.length > 50) {
      this.logger.error('이름이 50자 이상입니다.');
      throw new SsshException(
        ExceptionEnum.INVALID_PARAMETER,
        HttpStatus.BAD_REQUEST,
        {param: 'name'},
      );
    }

    this._name = name.replaceAll(' ', '_');
  }

  set topic(topic: iTopic) {
    this._topic = topic;
  }
  get topic(): iTopic {
    return this._topic;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toDto(): ReadSeriesDto {
    return {
      id: this._id,
      name: this._name,
      topic: this._topic ? this._topic.toDto() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
