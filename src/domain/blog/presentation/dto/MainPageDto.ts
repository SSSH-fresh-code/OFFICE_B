import { ApiProperty } from "@nestjs/swagger";
import { ReadPostDto } from "../post/dto/read-post.dto";
import { Page } from "../../../../infrastructure/common/services/paging.service";
import { LogDto } from "src/infrastructure/common/log/presentation/dto/log.dto";

export class MainPageDto {
	@ApiProperty({
		description: "최근 게시글",
	})
	recentPosts?: Page<ReadPostDto>;

	@ApiProperty({
		description: "최근 메세지",
	})
	recentMessage?: Page<LogDto>;
}
