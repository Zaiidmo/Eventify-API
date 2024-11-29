import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { UploadService } from './providers/upload.service';
  
  @Controller('upload')
  export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      try {
        console.log('Received file:', file);
        const result = await this.uploadService.uploadFile(file);
        return result;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }
  }