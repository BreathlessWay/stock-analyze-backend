import {
  Controller,
  UseGuards,
  UploadedFile,
  Post,
  UseInterceptors,
  FileTypeValidator,
  ParseFilePipe,
  MaxFileSizeValidator,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from '../Users/user.service';

import { aesDecrypt } from '../../utils';
// import { FileSizeValidationPipe } from '../pipe/fileValidation.pipe';

@Controller('earnings')
@UseGuards(AuthGuard)
export class AnalyzeController {
  constructor(private userService: UserService) {}

  @Delete('analyze_file')
  async removeFile(@Headers('token') token: string) {
    let operName: string;
    try {
      operName = aesDecrypt(token);
    } catch (e) {
      throw new UnauthorizedException('用户验证失败', e);
    }
    const res = await this.userService.updateFilePath({
      operName,
      uploadFilePath: '',
    });
    if (res) {
      return true;
    }
    throw '删除文件失败';
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFileAndValidate(
    @UploadedFile(
      // new FileSizeValidationPipe()
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
      // new ParseFilePipeBuilder()
      //   .addFileTypeValidator({
      //     fileType: 'jpeg',
      //   })
      //   .addMaxSizeValidator({
      //     maxSize: 1000
      //   })
      //   .build({
      //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      //   }),
    )
    file: Express.Multer.File,
  ) {
    return {
      file: file.buffer.toString(),
    };
  }
}
