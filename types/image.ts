export interface ImageData {
  id: string;
  url: string;
  fileName: string | null;
  s3Key?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}
