import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzerQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(6)
  stock_code?: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;
}

export type StockQueryDto = {
  stockCode: string[];

  start_date: string;

  end_date: string;
};
