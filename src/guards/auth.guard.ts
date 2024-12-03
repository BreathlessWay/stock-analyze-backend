import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import type { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers.token) {
      return true;
    }

    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        error: '用户尚未登录',
      },
      HttpStatus.FORBIDDEN,
      {
        cause: '未获取到登陆token',
      },
    );
  }
}
