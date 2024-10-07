import { Page } from "src/infrastructure/common/services/paging.service";
import { PagingPostDto } from "../../presentation/post/dto/paging-post.dto";
import { ReadPostDto } from "../../presentation/post/dto/read-post.dto";
import { CreatePostDto } from "../../presentation/post/dto/create-post.dto";
import { UpdatePostDto } from "../../presentation/post/dto/update-post.dto";

export interface iPostService {
	getPostById(id: number): Promise<ReadPostDto>;
	getPostByTitle(title: string): Promise<ReadPostDto>;
	getPosts(dto: PagingPostDto): Promise<Page<ReadPostDto>>;
	createPost(dto: CreatePostDto): Promise<ReadPostDto>;
	updatePost(dto: UpdatePostDto): Promise<ReadPostDto>;
	deletePost(id: number): Promise<void>;
}
