import { AggregateRoot } from "src/domain/aggregate-root.interface";
import { ReadTopicDto } from "../../presentation/topic/dto/read-topic.dto";

export interface iTopic {
	/**
	 * 토피 id를 반환합니다.
	 */
	get id(): number;

	/**
	 * 토피 이름을 반환합니다.
	 */
	get name(): string;

	/**
	 * topic name을 설정합니다.
	 * @param {string} name
	 */
	set name(name: string);

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
	toDto(): ReadTopicDto;
}
