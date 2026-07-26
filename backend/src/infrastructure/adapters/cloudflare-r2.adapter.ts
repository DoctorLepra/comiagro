import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { StoragePort } from '../../domain/ports/storage.port';

@Injectable()
export class CloudflareR2Adapter implements StoragePort {
  private readonly logger = new Logger(CloudflareR2Adapter.name);
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'comiagro';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      // Si R2_PUBLIC_URL está configurado, devolvemos la URL de descarga directa
      if (this.publicUrl) {
        return `${this.publicUrl}/${fileName}`;
      }

      // Si no hay URL pública configurada, solo devolvemos el identificador del archivo
      return fileName;
    } catch (error) {
      this.logger.error(`Error subiendo el archivo ${fileName} a Cloudflare R2`, error);
      throw new Error('No se pudo subir el archivo al almacenamiento en la nube.');
    }
  }
}
