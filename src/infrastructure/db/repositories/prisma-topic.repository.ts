import { TopicRepository } from "src/domain/blog/infrastructure/topic/topic.repository";
import { PrismaService } from "../prisma.service";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaTopicRepository implements TopicRepository {
  constructor(private readonly prisma: PrismaService) { }


  async findById(id: number): Promise<Topic> {
    const topic = await this.prisma.topic.findUniqueOrThrow({
      where: { id }
    });

    return Topic.of(topic);
  }

  async findByName(name: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUniqueOrThrow({
      where: { name }
    });

    return Topic.of(topic);
  }

  async save(topic: Topic): Promise<Topic> {
    const entity = await this.prisma.topic.create({
      data: { name: topic.name }
    })

    return Topic.of(entity);
  }

  async update(topic: Topic): Promise<Topic> {
    const entity = await this.prisma.topic.update({
      where: { id: topic.id },
      data: {
        name: topic.name
      }
    });

    return Topic.of(entity);
  }

  async delete(name: string): Promise<void> {
    await this.prisma.topic.delete({
      where: { name }
    });
  }
}
