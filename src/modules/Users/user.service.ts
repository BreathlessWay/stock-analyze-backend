import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// The Sequelize class is imported from the sequelize-typescript package.
import { Sequelize } from 'sequelize-typescript';

import { UserModel } from './user.model';

import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    private sequelize: Sequelize,
  ) {}

  async findUser(operName: string) {
    return this.userModel.findOne({
      where: { operName },
    });
  }

  async register(user: UserDto) {
    return await this.sequelize.transaction(async (t) => {
      const transactionHost = { transaction: t, returning: true };
      return await this.userModel.create(
        {
          operName: user.operName,
          passwd: user.passwd,
        },
        transactionHost,
      );
    });
  }

  async updateFilePath({
    operName,
    uploadFilePath,
  }: Pick<UserDto, 'operName'> & { uploadFilePath: string }) {
    return await this.userModel.update(
      {
        uploadFilePath,
      },
      {
        where: {
          operName: operName,
        },
      },
    );
  }
}
