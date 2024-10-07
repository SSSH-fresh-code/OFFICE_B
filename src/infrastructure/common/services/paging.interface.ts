import { Prisma } from "@prisma/client";
import { Page, WhereClause } from "./paging.service";
import { PagingDto } from "../dto/paging.dto";

export interface iPagingService {
	getPagedResults(
		model: Prisma.ModelName,
		pagingDto: PagingDto,
		where: WhereClause,
	): Promise<Page<any>>;
}
