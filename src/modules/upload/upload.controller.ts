import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import Response from '../../commons/response.js';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'documents');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `doc-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Tối đa 10MB
      fileFilter: (_req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return cb(
            new BadRequestException(
              'Chỉ cho phép tải lên file hình ảnh (.png, .jpg, .jpeg, .webp) và tài liệu Word (.doc, .docx)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file tải lên');
    }

    const filePath = `/uploads/documents/${file.filename}`;
    return Response.get({
      filePath,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    });
  }
}
