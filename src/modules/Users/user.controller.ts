import { Controller, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';

import { aesEncrypt } from '../../utils';

import { UserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // 9d25b4226ef057e5a1a05bcadf5c7ada

  @Post('login')
  async login(@Body() userDto: UserDto) {
    const res = await this.userService.findUser(userDto.operName);
    if (!res) {
      throw '用户尚未注册';
    }
    if (res.passwd !== userDto.passwd) {
      throw '用户密码错误';
    }
    return {
      token: aesEncrypt(res.operName),
    };
  }

  @Post('register')
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
