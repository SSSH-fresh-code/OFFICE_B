import { AggregateRoot } from "../../../domain/aggregate-root.interface";
import { ReadUserDto } from "../presentation/dto/read-user.dto";

/**
 * User 인터페이스
 */
export interface iUser extends AggregateRoot {
	get id(): string;
	get email(): string;
	set email(email: string);
	get password(): string;
	get name(): string;
	set name(name: string);
	get permissions(): string[];
	get createdAt(): Date;
	get updatedAt(): Date;

	/**
	 * 비밀번호를 기본값으로 재설정합니다.
	 */
	resetPassword(): void;

	/**
	 * 비밀번호가 일치하는지 검증합니다.
	 * @param password 검증할 비밀번호
	 * @returns boolean 비밀번호가 일치하면 true, 아니면 false를 반환합니다.
	 */
	validatePassword(password: string): boolean;

	/**
	 * Permissions을 설정합니다.
	 * @param permissions 설정할 Permissions
	 */
	assignPermissions(
		permissions:
			| {
					name: string;
					description: string;
					createdAt: Date;
					updatedAt: Date;
			  }[]
			| string[],
	): void;

	toDto(): ReadUserDto;
}
