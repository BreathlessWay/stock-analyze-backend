import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import type { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(context);
    return true;
  }
}
