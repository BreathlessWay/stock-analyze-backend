import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'operatorinfo',
  createdAt: false,
  updatedAt: false,
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

  @Column({
    type: DataType.STRING,
    defaultValue: '',
  })
  uploadFilePath: string;
}
