import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'closepriceinfo',
  createdAt: false,
  updatedAt: false,
})
export class StockPriceModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  tradeDate: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  stockCode: string;

  @Column({
    type: DataType.NUMBER,
  })
  price: number;
}

@Table({
  tableName: 'stockprofitdetialinfo',
  createdAt: false,
  updatedAt: false,
})
export class StockProfitModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  tradeDate: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING,
  })
  stockCode: string;

  @Column({
    type: DataType.NUMBER,
  })
  profitRatio: number;

  @Column({
    type: DataType.NUMBER,
  })
  changeRate: number;
}
