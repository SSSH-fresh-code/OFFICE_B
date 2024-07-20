import { iPost } from "src/domain/blog/domain/post/post.interface";
import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { Series } from "src/domain/blog/domain/series/series.entity";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";
import { PostRepository } from "src/domain/blog/infrastructure/post/post.repository";
import { Post } from "src/domain/blog/domain/post/post.entity";
import { User } from "src/domain/user/domain/user.entity";

@Injectable()
export class PrismaPostRepository implements PostRepository {

  constructor(private readonly prisma: PrismaService) { }

  async findById(id: number): Promise<iPost> {
    const post = await this.prisma.post.findUniqueOrThrow({
      where: { id },
      include: { topic: true, series: true, author: true }
    });

    const series = post.series ? Series.of(post.series) : null;

    return Post.of(post, User.of(post.author), Topic.of(post.topic), series);
  }

  async findByTitle(title: string): Promise<iPost> {
    const post = await this.prisma.post.findUniqueOrThrow({
      where: { title },
      include: { topic: true, series: true, author: true }
    });

    const series = post.series ? Series.of(post.series) : null;

    return Post.of(post, User.of(post.author), Topic.of(post.topic), series);
  }

  async save(post: Post): Promise<iPost> {
    const data = {
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      authorId: post.author.id,
      topicId: post.topic.id,
    }

    if (post.series) {
      data["seriesId"] = post.series.id;
    }

    const entity = await this.prisma.post.create({
      data,
      include: { topic: true, series: true, author: true }
    })

    const series = entity.series ? Series.of(entity.series) : null;

    return Post.of(entity, User.of(entity.author), Topic.of(entity.topic), series);
  }

  async update(post: Post): Promise<iPost> {
    const data = {
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      authorId: post.author.id,
      topicId: post.topic.id,
    }

    if (post.series) {
      data["seriesId"] = post.series.id;
    }
    const entity = await this.prisma.post.update({
      where: { id: post.id },
      data,
      include: { topic: true, series: true, author: true }
    });

    const series = entity.series ? Series.of(entity.series) : null;

    return Post.of(entity, User.of(entity.author), Topic.of(entity.topic), series);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.post.delete({
      where: { id }
    });
  }
}
