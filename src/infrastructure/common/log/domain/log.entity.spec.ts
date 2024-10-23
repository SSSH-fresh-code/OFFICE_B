import { LogDto } from "../presentation/dto/log.dto";
import { Log } from "./log.entity";
import { BusinessType, DataType } from "./log.enum";

describe("Log Entity", () => {
	let log: Log;

	const businessType = BusinessType.CHAT;
	const dataType = DataType.JSON;
	const data = '{"userId": "1234", "action": "register"}';
	const logDate = new Date();

	beforeEach(() => {
		log = new Log(businessType, dataType, data, undefined, logDate);
	});

	describe("생성자", () => {
		it("생성자를 사용하여 객체를 생성한다", () => {
			expect(log.id).toBeDefined(); // UUID가 정의되어야 함
			expect(log.businessType).toEqual(businessType);
			expect(log.dataType).toEqual(dataType);
			expect(log.data).toEqual(data);
			expect(log.logDate).toEqual(logDate);
		});

		it("기본 로그 일시는 현재 시간으로 설정된다", () => {
			const logWithoutDate = new Log(businessType, dataType, data);
			expect(logWithoutDate.logDate).toBeInstanceOf(Date);
		});
	});

	describe("toDto()", () => {
		it("엔티티를 LogDto로 변환할 수 있다", () => {
			const dto: LogDto = log.toDto();

			expect(dto.id).toEqual(log.id);
			expect(dto.businessType).toEqual(log.businessType);
			expect(dto.dataType).toEqual(log.dataType);
			expect(dto.data).toEqual(log.data);
			expect(dto.logDate).toEqual(log.logDate);
		});
	});
});
