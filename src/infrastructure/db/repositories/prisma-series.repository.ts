import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { SeriesRepository } from "src/domain/blog/infrastructure/series/series.repository";
import { iSeries } from "src/domain/blog/domain/series/series.interface";
import { Series } from "src/domain/blog/domain/series/series.entity";
import { Topic } from "src/domain/blog/domain/topic/topic.entity";

@Injectable()
export class PrismaSeriesRepository implements SeriesRepository {
  constructor(private readonly prisma: PrismaService) { }


  async findById(id: number): Promise<iSeries> {
    const series = await this.prisma.series.findUniqueOrThrow({
      where: { id },
      include: { topic: true }
    });


    return Series.of(series, Topic.of(series.topic));
  }

  async findByName(name: string): Promise<iSeries> {
    const series = await this.prisma.series.findUniqueOrThrow({
      where: { name },
      include: { topic: true }
    });

    return Series.of(series, Topic.of(series.topic));
  }

  async save(series: Series): Promise<iSeries> {
    const entity = await this.prisma.series.create({
      data: { name: series.name, topicId: series.topic.id },
      include: { topic: true }
    })

    return Series.of(entity, Topic.of(entity.topic));
  }

  async update(series: Series): Promise<iSeries> {
    const entity = await this.prisma.series.update({
      where: { id: series.id },
      data: {
        name: series.name,
        topicId: series.topic.id
      },
      include: { topic: true }
    });

    return Series.of(entity, Topic.of(entity.topic));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.series.delete({
      where: { id }
    });
  }
}
