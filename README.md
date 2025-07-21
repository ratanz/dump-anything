# Dump Anything

A versatile web application for uploading, storing, and sharing various types of content. Currently supporting image uploads with journal functionality.

## Features

- **Image Upload**: Upload images from your device or via URL
- **AWS S3 Integration**: Store images securely in Amazon S3
- **Journal**: Create and save journal entries
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon DB)
- **Storage**: AWS S3
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS account with S3 access
- Neon PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dump-anything.git
   cd dump-anything
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_URL="your-neon-db-connection-string"
   
   # AWS S3 Configuration
   AWS_REGION="your-aws-region"
   AWS_ACCESS_KEY_ID="your-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## AWS S3 Setup

See [AWS_S3_SETUP.md](AWS_S3_SETUP.md) for detailed instructions on setting up your S3 bucket.

## Database Schema

The application uses the following database schema:

### Image Model
- `id`: String (UUID, primary key)
- `url`: String (URL of the image)
- `fileName`: String (optional, name of the file)
- `s3Key`: String (optional, S3 object key)
- `fileSize`: Integer (optional, size in bytes)
- `mimeType`: String (optional, MIME type)
- `createdAt`: DateTime (when the image was uploaded)
- `updatedAt`: DateTime (when the image was last updated)

## API Routes

### `/api/upload`
- **Method**: POST
- **Description**: Upload an image file or URL
- **Body**: FormData with either `imageFile` or `imageUrl`
- **Response**: JSON with the created image object

### `/api/images`
- **Method**: GET
- **Description**: Get all images
- **Response**: JSON array of image objects

## Deployment

This application can be deployed to Vercel with the following steps:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js for the amazing framework
- Neon DB for the serverless PostgreSQL database
- AWS for the S3 storage service
