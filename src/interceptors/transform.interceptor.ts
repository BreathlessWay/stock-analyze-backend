import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err?.response?.statusCode === HttpStatus.UNAUTHORIZED) {
            return err;
          }
          return new BadRequestException(err);
        }),
      ),
      map((data) => {
        return { data, code: 0, msg: 'ok' };
      }),
    );
  }
}
