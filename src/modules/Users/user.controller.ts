import { Controller, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';

import { aesEncrypt } from '../../utils';

import type { UserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // 9d25b4226ef057e5a1a05bcadf5c7ada

  @Post()
  async login(@Body() userDto: UserDto) {
    const res = await this.userService.login(userDto);
    if (res) {
      return {
        token: aesEncrypt(res.operName),
      };
    }
    throw '用户尚未注册';
  }

  @Post()
  async register(@Body() userDto: UserDto) {
    const res = await this.userService.register(userDto);
    if (res) {
      return {
        token: aesEncrypt(res.operName),
      };
    }
    throw '用户注册失败';
  }
}
