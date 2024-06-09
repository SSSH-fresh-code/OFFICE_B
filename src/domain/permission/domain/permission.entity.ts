import { AggregateRoot } from "src/domain/aggregate-root.interface";
import { IPermission } from "./permission.interface";

/**
 * Permission 엔티티 클래스
 */
export class Permission implements IPermission {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _description?: string,
    private _createdAt?: Date,
    private _updatedAt?: Date,
  ) { }

  /**
   * ID getter
   * @returns string 권한 ID
   */
  public get id(): string {
    return this._id;
  }

  /**
   * 이름 getter
   * @returns string 권한 이름
   */
  public get name(): string {
    return this._name;
  }

  /**
   * 이름 setter (private)
   * @param name 설정할 이름
   */
  private set name(name: string) {
    this._name = name;
  }

  /**
   * 설명 getter
   * @returns string 권한 설명
   */
  public get description(): string {
    return this._description;
  }

  /**
   * 설명 setter (private)
   * @param description 설정할 설명
   */
  private set description(description: string) {
    this._description = description;
  }

  /**
   * 생성일 getter
   * @returns Date 생성일
   */
  public get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 수정일 getter
   * @returns Date 수정일
   */
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 권한 정보를 업데이트합니다.
   * @param name 새로운 권한 이름
   * @param description 새로운 권한 설명
   */
  public updateDetails(name: string, description?: string): void {
    this.name = name;
    this.description = description;
  }

  validate(): void {
    throw new Error("not implements");
  }
}