import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'closePriceInfo',
})
export class StockPriceModel extends Model {
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

@Table({
  tableName: 'stockProfitDetialInfo',
})
export class StockProfitModel extends Model {
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
