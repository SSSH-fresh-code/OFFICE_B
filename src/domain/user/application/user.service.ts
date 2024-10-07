import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../infrastructure/user.repository";
import { USER_REPOSITORY } from "../user.const";
import {
	Page,
	PagingService,
} from "../../../infrastructure/common/services/paging.service";
import { User } from "../domain/user.entity";
import { ReadUserDto } from "../presentation/dto/read-user.dto";
import { UserPagingDto } from "../presentation/dto/user-paging.dto";
import { v4 as uuidv4 } from "uuid";
import { UpdateUserDto } from "../presentation/dto/update-user.dto";
import { PermissionEnum } from "../../permission/domain/permission.enum";

@Injectable()
export class UserService {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
		private readonly pagingService: PagingService<User>,
	) {}

	async createUser(
		email: string,
		password: string,
		name: string,
	): Promise<ReadUserDto> {
		const user = new User(uuidv4(), email, password, name);
		user.encryptPassword();

		user.assignPermissions([PermissionEnum.CAN_LOGIN]);

		return (await this.userRepository.save(user)).toDto();
	}

	async updateUserName(
		updateUserDto: UpdateUserDto,
	): Promise<ReadUserDto | null> {
		const user = await this.userRepository.findById(updateUserDto.id);
		user.name = updateUserDto.name;

		return (await this.userRepository.save(user)).toDto();
	}

	async getUsers(pagingDto: UserPagingDto): Promise<Page<User>> {
		const where = {};

		if (pagingDto.where__email) {
			where["where__email"] = pagingDto.where__email;
		}

		if (pagingDto.like__name) {
			where["like__name"] = pagingDto.like__name;
		}

		const orderBy = {};

		if (pagingDto.orderby) {
			orderBy[pagingDto.orderby] = pagingDto.direction;
		}

		return this.pagingService.getPagedResults("User", pagingDto, where);
	}

	async getUserById(id: string): Promise<ReadUserDto> {
		const user = await this.userRepository.findById(id);

		return user.toDto();
	}

	async getUserByEmailForLogin(email: string): Promise<User | null> {
		let user = await this.userRepository.findByEmail(email);

		user = await this.userRepository.getPermissionByUser(user);

		return user;
	}

	async updateUserPermission(id: string, permissions: string[] = []) {
		const user = await this.userRepository.findById(id);

		user.assignPermissions(permissions);

		return (await this.userRepository.setPermission(user)).toDto();
	}
}
