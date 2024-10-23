import { v4 as uuidv4 } from "uuid";
import { iLog } from "./log.interface";
import { LogDto } from "../presentation/dto/log.dto";
import { Log as PrismaLog } from "@prisma/client";
import { BusinessType, DataType } from "./log.enum";

export class Log implements iLog {
	private readonly _id: string;
	private readonly _businessType: BusinessType;
	private readonly _dataType: DataType;
	private readonly _data: string;
	private readonly _logDate: Date;

	constructor(
		businessType: BusinessType,
		dataType: DataType,
		data: string,
		id: string = uuidv4(),
		logDate: Date = new Date(),
	) {
		this._id = id; // UUID 생성
		this._businessType = businessType;
		this._dataType = dataType;
		this._data = data;
		this._logDate = logDate;
	}

	// 고유 ID getter
	get id(): string {
		return this._id;
	}

	// 업무 타입 getter
	get businessType(): BusinessType {
		return this._businessType;
	}

	// 데이터 타입 getter
	get dataType(): DataType {
		return this._dataType;
	}

	// 데이터 getter
	get data(): string {
		return this._data;
	}

	// 로그 일시 getter
	get logDate(): Date {
		return this._logDate;
	}

	/** 엔티티를 DTO로 변환하는 메서드 */
	toDto(): LogDto {
		return {
			id: this._id,
			businessType: this._businessType,
			dataType: this._dataType,
			data: this._data,
			logDate: this._logDate,
		};
	}

	static of({ id, businessType, dataType, data, logDate }: PrismaLog) {
		const bt = BusinessType[businessType];
		const dt = DataType[dataType];
		return new Log(bt, dt, data, id, logDate);
	}
}
