import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1', // Update to us-east-1 which matches your bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false, // Use virtual-hosted style URLs (default)
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

// Function to upload a file to S3
export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string) {
  // Generate a unique file name to avoid collisions
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  
  // Set up the parameters for the PutObjectCommand
  const params = {
    Bucket: bucketName,
    Key: uniqueFileName,
    Body: file,
    ContentType: contentType,
  };

  try {
    // Upload the file to S3
    await s3Client.send(new PutObjectCommand(params));
    
    // Return the URL of the uploaded file using the correct region
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Function to generate a presigned URL for getting an object
export async function getSignedFileUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Function to delete a file from S3
export async function deleteFileFromS3(key: string) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}

// Helper function to extract the key from a full S3 URL
export function getKeyFromUrl(url: string) {
  // Example URL: https://bucket-name.s3.region.amazonaws.com/key
  const urlParts = url.split('.amazonaws.com/');
  return urlParts.length > 1 ? urlParts[1] : '';
} 