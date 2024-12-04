import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserService } from './user.service';

import type { Response } from 'express';
import type { UserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  @Get()
  async login1(
    @Res({ passthrough: true }) res: Response,
    @Query() query: UserDto,
  ) {
    console.log(query.username);

    const data = await this.userService.login(query);
    console.log(
      process.env.PROJECT_PORT,
      process.env.NODE_ENV,
      this.configService.get<string>('DATABASE_USER'),
    );
    res.status(HttpStatus.OK);
    return data;
  }

  @Post()
  login(@Body() userDto: UserDto) {
    console.log(userDto);
    return 'This action adds a new cat';
  }

  @Post()
  async register(@Body() userDto: UserDto) {
    console.log(userDto);
    return 'This action adds a new cat';
  }
}
