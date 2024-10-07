import { SetMetadata } from "@nestjs/common";

export const PermissionsClass = (...permissions: string[]) =>
	SetMetadata("permissions-class", permissions);
export const PermissionsMethod = (...permissions: string[]) =>
	SetMetadata("permissions-method", permissions);
