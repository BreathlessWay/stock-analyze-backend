import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

import { Statics_Folder_Name, Statics_Folder_Path } from './constants';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(cookieParser(), compression(), helmet());
  app.useStaticAssets(Statics_Folder_Path, {
    prefix: `/${Statics_Folder_Name}/`, //设置虚拟前缀路径
  });
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get('PROJECT_PORT');

  await app.listen(port, () => {
    console.log(`server start at http://localhost:${port}`);
  });
}
bootstrap();
