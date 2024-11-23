import { UserInSession } from "../../user/infrastructure/auth";
import { MainPageDto } from "../presentation/dto/MainPageDto";

export interface iBlogService {
	extractSiteMapFromPosts(): Promise<string>;
	getMain(user: UserInSession): Promise<MainPageDto>;
}
