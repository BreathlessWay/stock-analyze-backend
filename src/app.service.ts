import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
