import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'operatorInfo',
})
export class UserModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  operName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwd: string;
}
