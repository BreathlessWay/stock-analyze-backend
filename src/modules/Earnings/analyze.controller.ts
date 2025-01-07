import { relative, join, sep } from 'node:path';
import * as fs from 'node:fs';

import {
  Controller,
  UseGuards,
  UploadedFile,
  Post,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  Delete,
  Headers,
  UnauthorizedException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as ExcelJS from 'exceljs';
import { parse as CsvParse } from 'csv-parse';
import * as Joi from 'joi';
import { fromPairs } from 'lodash';
import * as dayjs from 'dayjs';

import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from '../Users/user.service';
import { AnalyzeService } from './analyze.service';

import { aesDecrypt, storageFile } from '../../utils';

import { AnalyzerQueryDto } from './analyze.dto';

import {
  Project_Folder_Path,
  Statics_Folder_Name,
  Statics_Folder_Path,
  Template_File_Path,
} from '../../constants';

@Controller('earnings')
@UseGuards(AuthGuard)
export class AnalyzeController {
  constructor(
    private analyzeService: AnalyzeService,
    private userService: UserService,
  ) {}

  getOperName(token: string) {
    try {
      return aesDecrypt(token);
    } catch (e) {
      throw new UnauthorizedException('用户验证失败', e);
    }
  }

  async parseExcel(fileFullPath: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fileFullPath);
    const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
    const rows = [];
    const rowDataSchema = Joi.array().items(
      Joi.string().length(6).required(),
      Joi.number().required(),
    );
    const errorRowIndexs: number[] = [];
    let msg = '';
    worksheet.eachRow((row, index) => {
      if (index === 1) return;
      const rowData = [];
      row.eachCell((cell) => {
        rowData.push(cell.value);
      });
      const { error } = rowDataSchema.validate(rowData);
      if (error) {
        errorRowIndexs.push(index);
      } else {
        rows.push(rowData);
      }
    });
    if (errorRowIndexs.length) {
      msg = `第${errorRowIndexs.join(',')}行存在不合规数据，已忽略`;
    }
    if (!rows.length) {
      throw '上传文件中未能检索到股票代码';
    }
    // 去重
    const rowMap: Record<string, number> = fromPairs(rows);
    return {
      stockCodeList: Object.keys(rowMap),
      stockCountMap: rowMap,
      msg,
    };
  }

  async parseCsv(fileFullPath: string): Promise<any> {
    const result = [];
    let index = 2;
    const rowDataSchema = Joi.array().items(
      Joi.string().length(6).required(),
      Joi.number().required(),
    );
    const errorRowIndexs: number[] = [];
    let msg = '';
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(fileFullPath)) {
        reject('上传的文件已失效，请删除后重新上传！');
      }
      fs.createReadStream(fileFullPath)
        .pipe(CsvParse({ fromLine: 2 }))
        .on('data', (data) => {
          const { error } = rowDataSchema.validate(data);
          if (error) {
            errorRowIndexs.push(index);
          } else {
            result.push(data);
          }
          index++;
        })
        .on('end', () => {
          if (errorRowIndexs.length) {
            msg = `第${errorRowIndexs.join(',')}行存在不合规数据，已忽略`;
          }
          if (!result.length) {
            reject('上传文件中未能检索到股票代码');
          }
          const rowMap: Record<string, number> = fromPairs(result);
          resolve({
            stockCodeList: Object.keys(rowMap),
            stockCountMap: rowMap,
            msg,
          });
        })
        .on('error', () => {
          reject('解析失败');
        });
    });
  }

  @Get('template_file')
  async templateFile() {
    return {
      template_file: relative(Project_Folder_Path, Template_File_Path)
        .split(sep)
        .join('/'),
    };
  }

  // 6d836336dfeb7a061f074c13a1c776c2
  @Delete('analyze_file')
  async removeFile(@Headers('token') token: string) {
    const operName = this.getOperName(token);
    const res = await this.userService.updateFilePath({
      operName,
      uploadFilePath: '',
    });
    if (res) {
      return true;
    }
    throw '删除文件失败';
  }

  @Post('analyze_file')
  @UseInterceptors(FileInterceptor('file', { storage: storageFile }))
  async uploadFileAndValidate(
    @Headers('token') token: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const operName = this.getOperName(token);
    if (!/xlsx|csv?$/g.test(file.originalname)) {
      throw '上传的不是 Excel 或者 csv 文件';
    }
    const uploadFilePath = join(
      Statics_Folder_Name,
      relative(Statics_Folder_Path, file.path),
    );
    const res = await this.userService.updateFilePath({
      operName,
      uploadFilePath,
    });
    if (res) {
      return {
        uploadFilePath: uploadFilePath.split(sep).join('/'),
      };
    }
    throw '文件上传失败';
  }

  @Get('analyze_stock')
  async analyzeStock(
    @Headers('token') token: string,
    @Query() query: AnalyzerQueryDto,
  ) {
    const operName = this.getOperName(token);
    const { stock_code } = query;
    let parseResult: {
      stockCodeList: string[];
      stockCountMap: Record<string, number>;
      msg: string;
    };
    if (!stock_code) {
      const res = await this.userService.findUser(operName);
      if (!res?.uploadFilePath) {
        throw '请添加需要分析的股票代码';
      }
      const fileFullPath = join(Project_Folder_Path, res.uploadFilePath);

      if (fileFullPath.endsWith('xlsx')) {
        parseResult = await this.parseExcel(fileFullPath);
      }
      if (fileFullPath.endsWith('csv')) {
        parseResult = await this.parseCsv(fileFullPath);
      }
    } else {
      parseResult = {
        stockCodeList: [stock_code],
        msg: '',
        stockCountMap: null,
      };
    }

    const { stockCodeList, stockCountMap, msg } = parseResult;

    const result = await this.analyzeService.findStock(
      {
        stockCode: stockCodeList,
        start_date: dayjs(Number(query.start_date))
          .subtract(1, 'day')
          .format('YYYYMMDD'),
        end_date: dayjs(Number(query.end_date)).format('YYYYMMDD'),
        service_charge: query.service_charge,
      },
      stockCountMap,
      token,
    );

    return {
      msg,
      ...result,
    };
  }

  @Get('analyze_file')
  async getAnalyzeFile(@Headers('token') token: string) {
    const operName = this.getOperName(token);
    const res = await this.analyzeService.exportAnalyzeResult(token, operName);
    return {
      analyze_file: res,
    };
  }
}
