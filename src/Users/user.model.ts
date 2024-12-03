import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class UserModel extends Model {
  @Column
  username: string;

  @Column
  password: string;
}
