import { TopicRepository } from "src/domain/blog/infrastructure/topic/topic.repository";
import { PrismaService } from "../prisma.service";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";

export class PrismatopicRepository implements TopicRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: number): Promise<Topic> {
    throw new Error("method not implement");
  }
  async findByName(name: string): Promise<Topic> {
    throw new Error("method not implement");
  }
  async save(topic: Topic): Promise<Topic> {
    throw new Error("method not implement");
  }
  async update(topic: Topic): Promise<Topic> {
    throw new Error("method not implement");
  }
  async delete(name: string): Promise<void> {
    throw new Error("method not implement");
  }
}
