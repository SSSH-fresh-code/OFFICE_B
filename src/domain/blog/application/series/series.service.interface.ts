import { Page } from "src/infrastructure/common/services/paging.service";
import { ReadSeriesDto } from "../../presentation/series/dto/read-series.dto";
import { PagingSeriesDto } from "../../presentation/series/dto/paging-series.dto";
import { CreateSeriesDto } from "../../presentation/series/dto/create-series.dto";
import { UpdateSeriesDto } from "../../presentation/series/dto/update-series.dto";

export interface iSeriesService {
  getSeriesByName(name: string): Promise<ReadSeriesDto>;
  getSeries(dto: PagingSeriesDto): Promise<Page<ReadSeriesDto>>;
  createSeries(dto: CreateSeriesDto): Promise<ReadSeriesDto>;
  updateSeries(dto: UpdateSeriesDto): Promise<ReadSeriesDto>;
  deleteSeries(id: number): Promise<void>;
}
