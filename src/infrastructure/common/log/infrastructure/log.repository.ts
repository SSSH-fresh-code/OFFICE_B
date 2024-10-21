import { Log } from "../domain/log.entity";

export interface LogRepository {
	/**
	 * ID(UUID)로 로그를 조회합니다.
	 * 대상 로그가 존재하지 않으면 null을 반환합니다.
	 *
	 * @param {string} id - 조회할 로그의 ID(UUID)
	 * @returns {Promise<Log | null>} - 조회된 로그 정보를 반환합니다.
	 */
	findById(id: string): Promise<Log | null>;

	/**
	 * 로그를 저장합니다. 로그는 생성 후 수정되지 않으며, 저장만 가능합니다.
	 *
	 * @param {Log} log - 저장할 로그 정보
	 * @returns {Promise<Log>} - 저장된 로그 정보를 반환합니다.
	 */
	save(log: Log): Promise<Log>;
}
