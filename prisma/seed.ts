import { PrismaClient } from "@prisma/client";
import {
	PermissionDescriptionEnum,
	PermissionEnum,
} from "../src/domain/permission/domain/permission.enum";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const keys = Object.keys(PermissionEnum);

	for (const key of keys) {
		const name = PermissionEnum[key];
		const description = PermissionDescriptionEnum[key];

		await prisma.permission.upsert({
			where: { name },
			create: { name, description },
			update: { description },
		});
	}
	const log_manager_email = process.env.LOG_MANAGER_EMAIL;
	const log_manager_pw = process.env.LOG_MANAGER_PW;

	if (log_manager_email && log_manager_pw) {
		const count = await prisma.user.count({
			where: { email: log_manager_email },
		});

		const pw = bcrypt.hashSync(log_manager_pw, 10);
		const permissions = [
			PermissionEnum.CAN_LOGIN,
			PermissionEnum.CAN_WRITE_CHAT,
		];

		if (count < 1) {
			await prisma.user.create({
				data: {
					email: log_manager_email,
					password: pw,
					name: "챗봇_관리자",
					permissions: {
						connect: permissions.map((p) => ({ name: p })),
					},
				},
			});
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
