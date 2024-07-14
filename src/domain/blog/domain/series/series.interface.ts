import { ReadSeriesDto } from "../../presentation/series/dto/read-series.dto";
import { iTopic } from "../topic/topic.interface";

export interface iSeries {

  /**
   * 시리즈 id를 반환합니다.
   */
  get id(): number;

  /**
   * 시리즈 이름을 반환합니다.
   */
  get name(): string;

  /**
   * 시리즈 name을 설정합니다.
   * @param {string} name
   */
  set name(name: string);


  /**
   * 시리즈 주제를 반환합니다.
   */
  get topic(): iTopic;

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
  toDto(): ReadSeriesDto;
}
