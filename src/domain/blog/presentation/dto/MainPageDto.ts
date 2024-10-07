import { ApiProperty } from "@nestjs/swagger";
import { ReadPostDto } from "../post/dto/read-post.dto";
import { Page } from "../../../../infrastructure/common/services/paging.service";

export class MainPageDto {
	@ApiProperty({
		description: "즐겨찾기",
		example: ["menu"],
	})
	favoritesMenu?: string[];

	@ApiProperty({
		description: "최근 게시글",
	})
	recentPosts?: Page<ReadPostDto>;
}
