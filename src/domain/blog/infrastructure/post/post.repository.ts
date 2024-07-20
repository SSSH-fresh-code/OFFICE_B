import { iPost } from "../../domain/post/post.interface";

export interface PostRepository {
  /**
   * ID로 Post을 조회합니다. 
   * 대상 Post이 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {number} id - 조회할 Post의 id
   * @returns {Promise<iPost>} - 조회된 Post 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Post가 존재하지 않으면 오류를 반환합니다.
   */
  findById(id: number): Promise<iPost>;

  /**
   * 제목으로 게시글을 조회합니다. 
   * 대상 Post가 존재하지 않으면 오류를 반환합니다.
   * 
   * @param {string} name - 조회할 Post의 이름
   * @returns {Promise<iPost>} - 조회된 Post 정보를 반환합니다.
   * @throws {Prisma.PrismaClientKnownRequestError} - 대상 Post가 존재하지 않으면 오류를 반환합니다.
   */
  findByTitle(name: string, includes?: boolean): Promise<iPost>;

  /**
   * Post를 저장합니다.  
   * @param {iPost} series - 저장할 Post 정보
   * @returns {Promise<iPost>} - 저장된 Post 정보를 반환합니다.
   */
  save(series: iPost): Promise<iPost>;

  /**
   * Post를 수정합니다.  
   * @param {Post} series - 수정할 Post 정보
   * @returns {Promise<iPost>} - 수정된 Post 정보를 반환합니다id
   */
  update(series: iPost): Promise<iPost>;

  /**
   * Post를 삭제합니다.  
   * @param {number} id - 삭제할 Post 이름
   */
  delete(id: number): Promise<void>;
}
