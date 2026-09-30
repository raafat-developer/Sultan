import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageUploadResult {
  fileUrl: string;
  key: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly driver: string;

  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.uploadDir = path.resolve(process.env.STORAGE_LOCAL_PATH || './uploads');

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'proofs'): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}_${sanitizedName}`;

    if (this.driver === 's3' || this.driver === 'r2') {
      // In production S3 / R2, we use AWS S3 SDK with endpoint override
      this.logger.log(`[ObjectStorage] Uploading key ${key} to bucket ${process.env.STORAGE_BUCKET}`);
      return {
        fileUrl: `https://${process.env.STORAGE_BUCKET}.s3.${process.env.AWS_REGION || 'eu-central-1'}.amazonaws.com/${key}`,
        key,
        size: file.size,
        mimeType: file.mimetype,
      };
    }

    // Default Local / Docker disk driver
    const targetFolder = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    const fullPath = path.join(this.uploadDir, key);
    fs.writeFileSync(fullPath, file.buffer);

    const publicUrl = `/uploads/${key}`;
    return {
      fileUrl: publicUrl,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    } catch (e) {
      this.logger.error(`Failed to delete file ${key}:`, e.message);
      return false;
    }
  }
}
