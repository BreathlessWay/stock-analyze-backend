import { relative, resolve, sep } from 'node:path';
import { existsSync } from 'node:fs';

import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import * as dayjs from 'dayjs';

import { AuthGuard } from '../../guards/auth.guard';

import { ReportQueryDto } from './report.dto';

import {
  Day_Report_Folder_Path,
  Project_Folder_Path,
  generateDayReportFileName,
} from '../../constants';

@Controller('day_report')
@UseGuards(AuthGuard)
export class ReportController {
  @Get('report_file')
  async templateFile(@Query() query: ReportQueryDto) {
    const day = dayjs(Number(query.date)).format('YYYYMMDD');
    const fileFullPath = resolve(
      Day_Report_Folder_Path,
      generateDayReportFileName(day),
    );

    if (!existsSync(fileFullPath)) {
      throw `未能查询到 ${day} 的报告`;
    }

    return {
      report_file: relative(Project_Folder_Path, fileFullPath)
        .split(sep)
        .join('/'),
    };
  }
}
