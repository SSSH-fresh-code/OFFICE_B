// src/domain/permission/domain/permission.interface.ts

import { AggregateRoot } from "../../../domain/aggregate-root.interface";

export interface IPermission extends AggregateRoot {
	/**
	 * 권한 이름을 반환합니다.
	 */
	get name(): string;

	/**
	 * 권한 설명을 반환합니다.
	 */
	get description(): string;

	/**
	 * 생성일을 반환합니다.
	 */
	get createdAt(): Date;

	/**
	 * 수정일을 반환합니다.
	 */
	get updatedAt(): Date;

	/**
	 * 권한 정보를 업데이트합니다.
	 * @param name 새로운 권한 이름
	 * @param description 새로운 권한 설명
	 */
	updateDetails(name: string, description?: string): void;
}
