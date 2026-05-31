import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@Injectable()
export class UploadService {
  async uploadImagemProduct(file: UploadedImageFile): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Imagem nao enviada');
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!connectionString || !containerName) {
      throw new InternalServerErrorException(
        'Configuracao do Azure Blob nao encontrada',
      );
    }

    const folder = process.env.AZURE_STORAGE_PRODUCT_IMAGES_PATH ?? 'products';
    const extension = extname(file.originalname);
    const fileName = `${folder}/${randomUUID()}${extension}`;
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      url: blockBlobClient.url,
    };
  }
}
