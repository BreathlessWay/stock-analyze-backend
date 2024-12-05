import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzerQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(6)
  stock_code?: string;

  @IsString()
  start_date: Date;

  @IsString()
  end_date: Date;
}
