import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from '../service/upload.service';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-product')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Arquivo deve ser uma imagem'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadImagemProduct(
    @UploadedFile() file: UploadedImageFile,
  ): Promise<{ url: string }> {
    return this.uploadService.uploadImagemProduct(file);
  }
}
