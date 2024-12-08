import { IsString } from 'class-validator';

export class ReportQueryDto {
  @IsString()
  date: string;
}
