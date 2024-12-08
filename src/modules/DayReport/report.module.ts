import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ReportController } from './report.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ReportController],
})
export class ReportModule {}
