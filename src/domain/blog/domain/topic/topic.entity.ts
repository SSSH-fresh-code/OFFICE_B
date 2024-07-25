import { HttpStatus, Logger } from "@nestjs/common";
import { iTopic } from "./topic.interface";
import { Topic as PrismaTopic } from "@prisma/client";
import { SsshException } from "src/infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { ReadTopicDto } from "../../presentation/topic/dto/read-topic.dto";

export class Topic implements iTopic {
  private readonly logger = new Logger(Topic.name);
  private _name: string;

  constructor(
    private _id: number,
    _name: string,
    private _createdAt?: Date,
    private _updatedAt?: Date
  ) {
    this.name = _name;
  }

  static of(topic: PrismaTopic) {
    return new this(
      topic.id,
      topic.name,
      topic.createdAt,
      topic.updatedAt
    )
  }

  /**
   * Getter
   */
  get id(): number { return this._id; }
  get name(): string { return this._name; }
  set name(name: string) {
    if (name.length > 50) {
      this.logger.error("이름이 50자 이상입니다.");
      throw new SsshException(ExceptionEnum.INVALID_PARAMETER, HttpStatus.BAD_REQUEST, { param: "name" });
    }

    this._name = name.replaceAll(" ", "_");
  }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  toDto(): ReadTopicDto {
    return {
      id: this._id,
      name: this._name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }
}
