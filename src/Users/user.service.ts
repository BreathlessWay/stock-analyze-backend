import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';

import { UserModel } from './user.model';

import type { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    private sequelize: Sequelize,
  ) {}

  private readonly user: UserDto = {
    username: 'sss',
    password: '122',
  };

  login(user: UserDto): Promise<UserModel | null> {
    return this.userModel.findOne({
      where: {
        username: user.username,
        password: user.password,
      },
    });
  }

  async register(user: UserDto) {
    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        await this.userModel.create(
          {
            username: user.username,
            password: user.password,
          },
          transactionHost,
        );
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  }
}
