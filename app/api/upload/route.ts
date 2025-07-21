import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { validateImageFile, isValidImageUrl } from '@/app/lib/utils';
import { uploadFileToS3 } from '@/app/lib/s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageUrl = formData.get('imageUrl') as string;
    const imageFile = formData.get('imageFile') as File | null;
    
    let url = '';
    let fileName = '';
    let s3Key: string | undefined = undefined;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (imageUrl) {
      // Validate URL
      if (!isValidImageUrl(imageUrl)) {
        return NextResponse.json({ error: 'Invalid image URL. URL must point to a JPG, PNG, GIF or WEBP file.' }, { status: 400 });
      }
      
      // For URL-based images, we just store the URL directly
      url = imageUrl;
      fileName = imageUrl.split('/').pop() || 'url-image';
      // No S3 key for external URLs
    } else if (imageFile) {
      // Validate file
      const validation = validateImageFile(imageFile);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error || 'Invalid file' }, { status: 400 });
      }
      
      // Get file data
      fileName = imageFile.name;
      fileSize = imageFile.size;
      mimeType = imageFile.type;
      
      // Convert the file to a buffer for S3 upload
      const fileBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      
      try {
        // Upload to S3 and get the URL
        url = await uploadFileToS3(buffer, fileName, mimeType);
        // Extract S3 key from the URL
        const urlParts = url.split('.amazonaws.com/');
        s3Key = urlParts.length > 1 ? urlParts[1] : undefined;
      } catch (error) {
        console.error('S3 upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Store in database with only the fields that are definitely in the schema
    // Use type assertion to handle the additional fields
    const image = await prisma.image.create({
      data: {
        url,
        fileName,
        ...(s3Key ? { s3Key } : {}),
        ...(fileSize !== null ? { fileSize } : {}),
        ...(mimeType ? { mimeType } : {})
      } as any
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 