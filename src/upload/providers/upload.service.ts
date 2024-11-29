import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { UploadInterface } from '../interfaces/upload.interface';

@Injectable()
export class UploadService implements UploadInterface {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string; }> {
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${Date.now()}.${fileExtension}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

    try { 
        console.log('Uploading file to S3...');
        const uploadResult = await this.s3.upload(params).promise();
        console.log('File uploaded to S3');
        return {
            url: uploadResult.Location,
            key: uploadResult.Key,
        };
    } catch (error) {
        throw new Error(`Error uploading file to S3: ${error.message}`);
    }
  }
}
