import { LogDto } from "../presentation/dto/log.dto";

export interface iLog {
	/** 고유 ID (UUID) */
	get id(): string;

	/** 업무 타입 */
	get businessType(): string;

	/** 데이터 타입 */
	get dataType(): string;

	/** 로그 데이터 */
	get data(): string;

	/** 로그 일시 */
	get logDate(): Date;

	toDto(): LogDto;
}
