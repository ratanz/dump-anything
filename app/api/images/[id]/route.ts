import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { deleteFileFromS3 } from '@/app/lib/s3';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // First, get the image to retrieve S3 info
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from S3 if it has an S3 key
    if (image.s3Key) {
      try {
        await deleteFileFromS3(image.s3Key);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
      }
    }
    // Continue with database deletion even if S3 deletion fails

    // Delete from database
    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 