import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UploadService } from '../service/upload.service';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-product')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Imagem enviada com sucesso',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://pedidos2.blob.core.windows.net/product-images/products/image.jpg',
        },
      },
    },
  })
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
