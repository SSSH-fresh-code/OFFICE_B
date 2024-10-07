import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { Post as PrismaPost } from "@prisma/client";
import { formatMessage } from "src/infrastructure/util/message.util";
import { Topic } from "../topic/topic.entity";
import { iPost } from "./post.interface";
import { Series } from "../series/series.entity";
import { User } from "src/domain/user/domain/user.entity";
import { Post, ofPost } from "./post.entity";
import { CreatePostDto } from "../../presentation/post/dto/create-post.dto";

describe("Post Entity", () => {
	let post: iPost;
	const user = new User(
		"mmm-mmmmm-mmm",
		"email@email.com",
		"password",
		"name",
		[],
	);
	const topic = new Topic(1, "topic");
	const series = new Series(1, "series", topic);

	beforeEach(() => {
		post = null;
	});

	const convertName = (str: string) => str.replaceAll(" ", "_");
	const dto: CreatePostDto = {
		title: "제목 입니다",
		content: "내용입니다.",
		thumbnail: "001.avif",
		authorName: user.name,
		topicId: topic.id,
		seriesId: series.id,
	};

	describe("생성자", () => {
		it("생성자 사용하여 객체 생성", () => {
			const id = 1;

			const { title, content, thumbnail } = dto;
			post = new Post(id, title, content, user, topic, series, thumbnail);

			expect(post.id).toEqual(id);
			expect(post.title).toEqual(convertName(title));
			expect(post.title).not.toEqual(title);
			expect(post.content).toEqual(content);
			expect(post.thumbnail).toEqual(thumbnail);
			expect(post.author).toEqual(user);
			expect(post.topic).toEqual(topic);
			expect(post.series).toEqual(series);
		});

		it("생성자 사용하여 썸네일 없는 객체 생성", () => {
			const id = 1;

			const { title, content } = dto;
			post = new Post(id, title, content, user, topic, series);

			expect(post.id).toEqual(id);
			expect(post.title).toEqual(convertName(title));
			expect(post.title).not.toEqual(title);
			expect(post.content).toEqual(content);
			expect(post.thumbnail).toBeUndefined();
			expect(post.author).toEqual(user);
			expect(post.topic).toEqual(topic);
			expect(post.series).toEqual(series);
		});

		it("생성자 사용하여 시리즈 없는 객체 생성", () => {
			const id = 1;

			const { title, content, thumbnail } = dto;
			post = new Post(id, title, content, user, topic, undefined, thumbnail);

			expect(post.id).toEqual(id);
			expect(post.title).toEqual(convertName(title));
			expect(post.title).not.toEqual(title);
			expect(post.content).toEqual(content);
			expect(post.thumbnail).toEqual(thumbnail);
			expect(post.author).toEqual(user);
			expect(post.topic).toEqual(topic);
			expect(post.series).toBeUndefined();
		});

		it("생성자 사용하여 시리즈, 썸네일 없는 객체 생성", () => {
			const id = 1;

			const { title, content } = dto;
			post = new Post(id, title, content, user, topic);

			expect(post.id).toEqual(id);
			expect(post.title).toEqual(convertName(title));
			expect(post.title).not.toEqual(title);
			expect(post.content).toEqual(content);
			expect(post.thumbnail).toBeUndefined();
			expect(post.author).toEqual(user);
			expect(post.topic).toEqual(topic);
			expect(post.series).toBeUndefined();
		});
	});

	describe("get id()", () => {
		it("아이디 조회", () => {
			const id = 1;

			const { title, content, thumbnail } = dto;
			post = new Post(id, title, content, user, topic, series, thumbnail);

			expect(post.id).toEqual(1);
		});
	});

	describe("get title()", () => {
		it("제목 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.title).toEqual(convertName(title));
		});
	});

	describe("set title()", () => {
		it("제목 설정", () => {
			const updateTitle = "수정된 제목";
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.title = updateTitle;

			expect(post.title).toEqual(convertName(updateTitle));
		});

		it("50자 이상으로 제목 설정", () => {
			let text = "";
			while (text.length < 52) {
				text += "d";
			}

			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(() => {
				post.title = text;
			}).toThrow(
				formatMessage(ExceptionEnum.INVALID_PARAMETER, { param: "title" }),
			);
		});
	});

	describe("get content()", () => {
		it("내용 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.content).toEqual(content);
		});
	});

	describe("set content()", () => {
		it("내용 설정", () => {
			const updateContent = "수정된 내용";
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.content = updateContent;

			expect(post.content).toEqual(updateContent);
		});
	});

	describe("get thumbnail()", () => {
		it("썸네일 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.thumbnail).toEqual(thumbnail);
		});
	});

	describe("set thumbnail()", () => {
		it("썸네일 설정", () => {
			const updateThumbnail = "modified001.avif";

			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.thumbnail = updateThumbnail;

			expect(post.thumbnail).toEqual(updateThumbnail);
		});

		it("썸네일 제거", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.thumbnail = undefined;

			expect(post.thumbnail).toEqual(undefined);
		});
	});

	describe("get author()", () => {
		it("작성자 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.author.id).toEqual(user.id);
			expect(post.author.email).toEqual(user.email);
		});
	});

	describe("set author()", () => {
		it("작성자 설정", () => {
			const newUser = new User(
				"aaaaa-aaa-aaaaa",
				"new@user.com",
				"passssss",
				"name2",
			);

			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.author = newUser;

			expect(post.author.id).not.toEqual(user.id);
			expect(post.author.email).not.toEqual(user.email);
			expect(post.author.id).toEqual(newUser.id);
			expect(post.author.email).toEqual(newUser.email);
		});
	});

	describe("get topic()", () => {
		it("주제 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.topic.id).toEqual(topic.id);
			expect(post.topic.name).toEqual(topic.name);
		});
	});

	describe("set topic()", () => {
		it("주제 설정", () => {
			const newTopic = new Topic(2, "topic2");

			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.topic = newTopic;

			expect(post.topic.id).not.toEqual(topic.id);
			expect(post.topic.name).not.toEqual(topic.name);
			expect(post.topic.id).toEqual(newTopic.id);
			expect(post.topic.name).toEqual(newTopic.name);
		});
	});

	describe("get series()", () => {
		it("시리즈 조회", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			expect(post.series.id).toEqual(series.id);
			expect(post.series.name).toEqual(series.name);
		});
	});

	describe("set series()", () => {
		it("시리즈 설정", () => {
			const newSeries = new Series(2, "series2", topic);

			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.series = newSeries;

			expect(post.series.id).not.toEqual(series.id);
			expect(post.series.name).not.toEqual(series.name);
			expect(post.series.id).toEqual(newSeries.id);
			expect(post.series.name).toEqual(newSeries.name);
		});

		it("시리즈 제거", () => {
			const { title, content, thumbnail } = dto;
			post = new Post(1, title, content, user, topic, series, thumbnail);

			post.series = undefined;

			expect(post.series).toEqual(undefined);
		});
	});

	describe("get createdAt()", () => {
		it("생성일자 조회", () => {
			const date = new Date();

			const { title, content, thumbnail } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				series,
				thumbnail,
				date,
				date,
			);

			expect(post.createdAt).toEqual(date);
		});
	});

	describe("get updatedAt()", () => {
		it("수정일자 조회", () => {
			const date = new Date();

			const { title, content, thumbnail } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				series,
				thumbnail,
				date,
				date,
			);

			expect(post.updatedAt).toEqual(date);
		});
	});

	describe("of", () => {
		it("정적 생성자 사용", () => {
			const p: ofPost = {
				id: 1,
				title: "제목_입니다",
				content: "내용입니다.",
				thumbnail: "001.avif",
				author: {
					id: user.id,
					email: user.email,
					password: user.password,
					name: user.name,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				authorName: user.name,
				topicId: topic.id,
				seriesId: series.id,
				topic: {
					id: topic.id,
					name: topic.name,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				series: {
					id: series.id,
					name: series.name,
					topicId: series.topic.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const ofPost = Post.of(p);

			expect(p.id).toEqual(ofPost.id);
			expect(p.author.id).toEqual(ofPost.author.id);
			expect(p.author.name).toEqual(ofPost.author.name);
			expect(p.topic.id).toEqual(ofPost.topic.id);
			expect(p.series.id).toEqual(ofPost.series.id);
		});
	});

	describe("toDto", () => {
		it("ReadPostDto 로 변환", () => {
			const date = new Date();

			const { title, content, thumbnail } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				series,
				thumbnail,
				date,
				date,
			);

			const postDto = post.toDto();

			expect(post.id).toEqual(postDto.id);
			expect(post.title).toEqual(postDto.title);
			expect(post.content).toEqual(postDto.content);
			expect(post.thumbnail).toEqual(postDto.thumbnail);
			expect(post.author.toDto()).toEqual(postDto.author);
			expect(post.topic.toDto()).toEqual(postDto.topic);
			expect(post.series.toDto()).toEqual(postDto.series);
			expect(post.createdAt).toEqual(postDto.createdAt);
			expect(post.updatedAt).toEqual(postDto.updatedAt);
		});

		it("썸네일 없는 ReadPostDto 로 변환", () => {
			const date = new Date();

			const { title, content } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				series,
				undefined,
				date,
				date,
			);

			const postDto = post.toDto();

			expect(post.id).toEqual(postDto.id);
			expect(post.title).toEqual(postDto.title);
			expect(post.content).toEqual(postDto.content);
			expect(postDto.thumbnail).toBeUndefined();
			expect(post.author.toDto()).toEqual(postDto.author);
			expect(post.topic.toDto()).toEqual(postDto.topic);
			expect(post.series.toDto()).toEqual(postDto.series);
			expect(post.createdAt).toEqual(postDto.createdAt);
			expect(post.updatedAt).toEqual(postDto.updatedAt);
		});

		it("시리즈 없는 ReadPostDto 로 변환", () => {
			const date = new Date();

			const { title, content, thumbnail } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				undefined,
				thumbnail,
				date,
				date,
			);

			const postDto = post.toDto();

			expect(post.id).toEqual(postDto.id);
			expect(post.title).toEqual(postDto.title);
			expect(post.content).toEqual(postDto.content);
			expect(post.thumbnail).toEqual(postDto.thumbnail);
			expect(post.author.toDto()).toEqual(postDto.author);
			expect(post.topic.toDto()).toEqual(postDto.topic);
			expect(postDto.series).toBeNull();
			expect(post.createdAt).toEqual(postDto.createdAt);
			expect(post.updatedAt).toEqual(postDto.updatedAt);
		});

		it("시리즈, 썸네일 없는 ReadPostDto 로 변환", () => {
			const date = new Date();

			const { title, content } = dto;
			post = new Post(
				1,
				title,
				content,
				user,
				topic,
				undefined,
				undefined,
				date,
				date,
			);

			const postDto = post.toDto();

			expect(post.id).toEqual(postDto.id);
			expect(post.title).toEqual(postDto.title);
			expect(post.content).toEqual(postDto.content);
			expect(postDto.thumbnail).toBeUndefined();
			expect(post.author.toDto()).toEqual(postDto.author);
			expect(post.topic.toDto()).toEqual(postDto.topic);
			expect(postDto.series).toBeNull();
			expect(post.createdAt).toEqual(postDto.createdAt);
			expect(post.updatedAt).toEqual(postDto.updatedAt);
		});
	});
});
