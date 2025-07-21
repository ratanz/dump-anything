-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "s3Key" TEXT;
