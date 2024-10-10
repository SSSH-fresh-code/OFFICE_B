import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { iChat } from "../domain/chat.interface";
import { iChatBot } from "../domain/chatbot.interface";
import { iMessengerExternalService } from "./messenger.external.interface";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

@Injectable()
export class DiscordExternalService implements iMessengerExternalService {
	readonly instanceId: number;

	constructor(
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {
		this.instanceId = Math.random();
	}
	readonly API_URL = "https://discord.com/api/webhooks/{1}/{2}";
	async chat(bot: iChatBot, chat: iChat, msg: string) {
		const url = this.API_URL.replace("{1}", bot.token).replace(
			"{2}",
			bot.botId,
		);

		const payload = JSON.stringify({
			content: msg,
			username: bot.name,
		});

		const call = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: payload,
		});

		if (call.ok) {
			this.logger.info(
				`${bot.name}이 ${chat.name}으로 메세지를 전송했습니다.\n내용 : ${msg}`,
			);
			return true;
		}

		throw new SsshException(
			ExceptionEnum.MESSAGE_SENDING_ERROR,
			HttpStatus.INTERNAL_SERVER_ERROR,
			{ param: "디스코드" },
		);
	}
}
