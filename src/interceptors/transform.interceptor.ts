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
          console.log(err);
          if (err?.response?.statusCode) {
            return err;
          }
          if (err.name) {
            return new BadRequestException(err.name);
          }
          return new BadRequestException(err);
        }),
      ),
      map((data) => {
        const result = { data, statusCode: HttpStatus.OK, message: 'ok' };
        if (data?.msg) {
          result.message = data?.msg;
          delete data.msg;
        }
        return result;
      }),
    );
  }
}
