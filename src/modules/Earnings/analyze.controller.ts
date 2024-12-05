import { relative, join } from 'node:path';

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
import * as Joi from 'joi';
import { fromPairs } from 'lodash';

import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from '../Users/user.service';

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
  constructor(private userService: UserService) {}

  getOperName(token: string) {
    try {
      return aesDecrypt(token);
    } catch (e) {
      throw new UnauthorizedException('用户验证失败', e);
    }
  }

  @Get('template_file')
  async templateFile() {
    return {
      template_file: Template_File_Path,
    };
  }

  @Delete('analyze_file')
  async removeFile(@Headers('token') token: string) {
    const res = await this.userService.updateFilePath({
      operName: this.getOperName(token),
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
    if (!/xlsx?$/g.test(file.originalname)) {
      throw '上传的不是 Excel 文件';
    }
    const res = await this.userService.updateFilePath({
      operName,
      uploadFilePath: join(
        Statics_Folder_Name,
        relative(Statics_Folder_Path, file.path),
      ),
    });
    if (res) {
      return true;
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
    if (!stock_code) {
      const res = await this.userService.findUser(operName);
      if (!res?.uploadFilePath) {
        throw '请添加需要分析的股票代码';
      }
      const fileFullPath = join(Project_Folder_Path, res.uploadFilePath);
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
        throw msg || '上传文件中未能检索到股票代码';
      }
      // 去重
      const rowMap: Record<string, number> = fromPairs(rows);
      const stockCodeList = Object.keys(rowMap);
      const stockWeightList = Object.values(rowMap);
      return {
        stockCodeList,
        stockWeightList,
        msg,
      };
    }
  }
}
