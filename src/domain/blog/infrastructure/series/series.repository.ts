import { iSeries } from "../../domain/series/series.interface";

export interface SeriesRepository {
  /**
   * ID로 Series을 조회합니다. 
   * 대상 Series이 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {number} id - 조회할 Series의 id
   * @returns {Promise<iSeries>} - 조회된 Series 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Series가 존재하지 않으면 오류를 반환합니다.
   */
  findById(id: number): Promise<iSeries>;

  /**
   * 이름 Series를 조회합니다. 
   * 대상 Series가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} name - 조회할 Series의 이름
   * @returns {Promise<iSeries>} - 조회된 Series 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Series가 존재하지 않으면 오류를 반환합니다.
   */
  findByName(name: string, includes?: boolean): Promise<iSeries>;

  /**
   * Series를 저장합니다.  
   * @param {iSeries} series - 저장할 Series 정보
   * @returns {Promise<iSeries>} - 저장된 Series 정보를 반환합니다.
   */
  save(series: iSeries): Promise<iSeries>;

  /**
   * Series를 수정합니다.  
   * @param {Series} series - 수정할 Series 정보
   * @returns {Promise<iSeries>} - 수정된 Series 정보를 반환합니다id
   */
  update(series: iSeries): Promise<iSeries>;

  /**
   * Series를 삭제합니다.  
   * @param {number} id - 삭제할 Series 이름
   */
  delete(id: number): Promise<void>;
}
