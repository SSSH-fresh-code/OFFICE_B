import {iPost} from 'src/domain/blog/domain/post/post.interface';
import {PrismaService} from '../prisma.service';
import {Injectable} from '@nestjs/common';
import {PostRepository} from 'src/domain/blog/infrastructure/post/post.repository';
import {Post} from 'src/domain/blog/domain/post/post.entity';

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<iPost> {
    const post = await this.prisma.post.findUniqueOrThrow({
      where: {id},
      include: {topic: true, series: true, author: true},
    });

    return Post.of(post);
  }

  async findByTitle(title: string): Promise<iPost> {
    const post = await this.prisma.post.findUniqueOrThrow({
      where: {title},
      include: {topic: true, series: true, author: true},
    });

    return Post.of(post);
  }

  async save(post: Post): Promise<iPost> {
    const data = {
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      authorName: post.author.name,
      topicId: post.topic.id,
    };

    if (post.series) {
      data['seriesId'] = post.series.id;
    }

    const entity = await this.prisma.post.create({
      data,
      include: {topic: true, series: true, author: true},
    });

    return Post.of(entity);
  }

  async update(post: Post): Promise<iPost> {
    const data = {
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      authorName: post.author.name,
      topicId: post.topic.id,
    };

    data['seriesId'] = post.series ? post.series.id : null;

    const entity = await this.prisma.post.update({
      where: {id: post.id},
      data,
      include: {topic: true, series: true, author: true},
    });

    return Post.of(entity);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.post.delete({
      where: {id},
    });
  }
}
