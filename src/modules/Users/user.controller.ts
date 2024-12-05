import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from './user.service';

import { aesDecrypt, aesEncrypt } from '../../utils';

import { UserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // 9d25b4226ef057e5a1a05bcadf5c7ada

  getOperName(token: string) {
    try {
      return aesDecrypt(token);
    } catch (e) {
      throw new UnauthorizedException('用户验证失败', e);
    }
  }

  @Get('info')
  async getUserInfo(@Headers('token') token: string) {
    const operName = this.getOperName(token);
    const res = await this.userService.findUser(operName);
    if (!res) {
      throw '用户尚未注册';
    }
    return {
      token: aesEncrypt(res.operName),
      operName: res.operName,
      uploadFilePath: res.uploadFilePath,
    };
  }

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
      operName: res.operName,
      uploadFilePath: res.uploadFilePath,
    };
  }

  @Post('register')
  async register(@Body() userDto: UserDto) {
    const res = await this.userService.register(userDto);
    if (res) {
      return {
        token: aesEncrypt(res.operName),
        operName: res.operName,
        uploadFilePath: res.uploadFilePath,
      };
    }
    throw '用户注册失败';
  }
}
