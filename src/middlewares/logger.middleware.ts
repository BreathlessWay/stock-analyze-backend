import { Injectable } from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';
import type { NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
