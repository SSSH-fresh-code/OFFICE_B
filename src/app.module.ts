import { Module } from "@nestjs/common";
import { InfraModule } from "./infrastructure/infra.module";
import { UserModule } from "./domain/user/user.module";
import { PermissionModule } from "./domain/permission/permission.module";
import { ChatBotModule } from "./domain/chatbot/chatbot.module";
import { BlogModule } from "./domain/blog/blog.module";
import { LogModule } from "./infrastructure/common/log/log.module";

@Module({
	imports: [
		InfraModule,
		UserModule,
		PermissionModule,
		ChatBotModule,
		BlogModule,
		LogModule,
	],
})
export class AppModule {}
