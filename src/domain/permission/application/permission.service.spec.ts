import { Test, TestingModule } from "@nestjs/testing";
import { PermissionService } from "./permission.service";
import { IPermissionRepository } from "../infrastructure/permission.repository";
import { CreatePermissionDto } from "../presentation/dto/create-permission.dto";
import { UpdatePermissionDto } from "../presentation/dto/update-permission.dto";
import { Permission } from "../domain/permission.entity";
import { PERMISSION_REPOSITORY } from "../permission.const";

/**
 * Mock Permission Repository
 * 권한 저장소의 Mock 함수들을 정의합니다.
 */
const mockPermissionRepository = (): IPermissionRepository => ({
	createPermission: jest.fn(),
	updatePermission: jest.fn(),
	findAll: jest.fn(),
	findByName: jest.fn(),
	deletePermission: jest.fn(),
});

describe("PermissionService", () => {
	let permissionService: PermissionService;
	let permissionRepository: jest.Mocked<IPermissionRepository>;
	let permission: Permission;

	const createDto: CreatePermissionDto = {
		name: "TEST0001",
		description: "테스트 권한입니다.",
	};

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PermissionService,
				{
					provide: PERMISSION_REPOSITORY,
					useFactory: mockPermissionRepository,
				},
			],
		}).compile();

		permissionService = module.get<PermissionService>(PermissionService);
		permissionRepository = module.get<IPermissionRepository>(
			PERMISSION_REPOSITORY,
		) as jest.Mocked<IPermissionRepository>;
	});

	beforeEach(() => {
		permission = new Permission(createDto.name, createDto.description);
	});

	describe("createPermission", () => {
		it("권한을 성공적으로 생성해야 합니다.", async () => {
			permissionRepository.createPermission.mockResolvedValue(permission);

			const result = await permissionService.createPermission(createDto);

			expect(result).toEqual(permission.toDto());
			expect(permissionRepository.createPermission).toHaveBeenCalledWith(
				permission,
			);
		});
	});

	describe("updatePermission", () => {
		it("권한을 성공적으로 업데이트해야 합니다.", async () => {
			const updateDto: UpdatePermissionDto = {
				...createDto,
				description: "업데이트 내용",
			};

			const updatedPermission = new Permission(
				updateDto.name,
				updateDto.description,
			);

			permissionRepository.findByName.mockResolvedValue(permission);

			permissionRepository.updatePermission.mockResolvedValue(
				updatedPermission,
			);

			const result = await permissionService.updatePermission(updateDto);

			expect(result).toEqual(updatedPermission.toDto());
			expect(permissionRepository.findByName).toHaveBeenCalledWith(
				createDto.name,
			);
			expect(permissionRepository.updatePermission).toHaveBeenCalledWith(
				expect.any(Permission),
			);
		});
	});

	describe("getPermissions", () => {
		it("권한 목록을 성공적으로 반환해야 합니다.", async () => {
			const permissions = [
				permission,
				new Permission("TEST0002", permission.description),
			];

			permissionRepository.findAll.mockResolvedValue(permissions);

			const result = await permissionService.getPermissions();

			expect(result).toEqual(permissions.map((p) => p.toDto()));
			expect(permissionRepository.findAll).toHaveBeenCalled();
		});
	});

	describe("getPermissionByName", () => {
		it("권한을 성공적으로 반환해야 합니다.", async () => {
			permissionRepository.findByName.mockResolvedValue(permission);

			const result = await permissionService.getPermissionByName(
				permission.name,
			);

			expect(result).toEqual(permission.toDto());
			expect(permissionRepository.findByName).toHaveBeenCalledWith(
				permission.name,
			);
		});
	});

	describe("deletePermission", () => {
		it("이름으로 권한을 삭제해야 합니다.", async () => {
			permissionRepository.deletePermission.mockResolvedValue();

			await permissionService.deletePermission("name");

			expect(permissionRepository.deletePermission).toHaveBeenCalledWith(
				"name",
			);
		});
	});
});
