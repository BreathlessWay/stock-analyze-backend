import {
  Controller,
  Get,
  Res,
  HttpStatus,
  UseGuards,
  UploadedFile,
  Post,
  UseInterceptors,
  FileTypeValidator,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from '../guards/auth.guard';
// import { FileSizeValidationPipe } from '../pipe/fileValidation.pipe';

import type { Response } from 'express';

@Controller('earnings')
@UseGuards(AuthGuard)
export class UserController {
  @Get('analyze')
  login1(@Res() res: Response) {
    res.status(HttpStatus.OK).send('data');
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
