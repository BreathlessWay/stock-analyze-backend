import { Controller, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';

import type { UserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async login(@Body() userDto: UserDto) {
    const res = await this.userService.login(userDto);
    if (res) {
      return res;
    }
    throw '用户尚未注册';
  }

  @Post()
  async register(@Body() userDto: UserDto) {
    return await this.userService.register(userDto);
  }
}
