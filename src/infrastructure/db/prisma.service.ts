import { Prisma, PrismaClient } from "@prisma/client";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(configService: ConfigService) {
		super({
			datasources: {
				db: {
					url: configService.get<string>("DATABASE_URL"),
				},
			},
		});
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}

	async cleanDatabase(names: Prisma.ModelName[]) {
		await this.$executeRaw`PRAGMA foreign_keys = OFF;`;
		for (const name of names) await this[name].deleteMany();
	}
}
