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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from '../Users/user.service';

import { aesDecrypt, storageFile } from '../../utils';

import {
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
}
