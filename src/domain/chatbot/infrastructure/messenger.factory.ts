import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { MessengerType } from "../domain/chatbot.entity";
import { iMessengerExternalService } from "../application/messenger.external.interface";
import { SsshException } from "../../../infrastructure/filter/exception/sssh.exception";
import { ExceptionEnum } from "../../../infrastructure/filter/exception/exception.enum";

@Injectable()
export class MessengerFactory {
	constructor(
		@Inject(MessengerType.TELEGRAM)
		private readonly telegramExternalService: iMessengerExternalService,
		@Inject(MessengerType.DISCORD)
		private readonly discordExternalService: iMessengerExternalService,
	) {}

	getMessengerService(type: MessengerType) {
		switch (type) {
			case MessengerType.TELEGRAM:
				return this.telegramExternalService;
			case MessengerType.DISCORD:
				return this.discordExternalService;
			default:
				throw new SsshException(
					ExceptionEnum.NOT_IMPLEMENTED,
					HttpStatus.NOT_IMPLEMENTED,
				);
		}
	}
}
