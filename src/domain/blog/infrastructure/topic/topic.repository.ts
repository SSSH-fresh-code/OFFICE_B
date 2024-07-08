import { Topic } from "../../domain/topic/topic.entity";

export interface TopicRepository {
  /**
   * ID로 Topic을 조회합니다. 
   * 대상 Topic이 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {number} id - 조회할 Topic의 id
   * @returns {Promise<Topic>} - 조회된 Topic 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Topic가 존재하지 않으면 오류를 반환합니다.
   */
  findById(id: number): Promise<Topic>;

  /**
   * 이름 Topic를 조회합니다. 
   * 대상 Topic가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} name - 조회할 Topic의 이름
   * @returns {Promise<Topic>} - 조회된 Topic 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Topic가 존재하지 않으면 오류를 반환합니다.
   */
  findByName(name: string, includes?: boolean): Promise<Topic>;

  /**
   * Topic를 저장합니다.  
   * @param {Topic} topic - 저장할 Topic 정보
   * @returns {Promise<Topic>} - 저장된 Topic 정보를 반환합니다.
   */
  save(topic: Topic): Promise<Topic>;

  /**
   * Topic를 수정합니다.  
   * @param {Topic} topic - 수정할 Topic 정보
   * @returns {Promise<Topic>} - 수정된 Topic 정보를 반환합니다id
   */
  update(topic: Topic): Promise<Topic>;

  /**
   * Topic를 삭제합니다.  
   * @param {string} name - 삭제할 Topic 이름
   */
  delete(name: string): Promise<void>;
}
