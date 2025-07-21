# AWS S3 Setup Guide for Image Storage

This guide will help you set up AWS S3 for storing images in your application.

## Step 1: Create an S3 Bucket

1. Sign in to the AWS Management Console and open the S3 console at https://console.aws.amazon.com/s3/
2. Choose **Create bucket**
3. Enter a unique bucket name (e.g., `dump-anything-images`)
4. Select the AWS Region where you want the bucket to reside (e.g., `eu-north-1`)
5. Configure the bucket settings:
   - For public access, you can either:
     - Block all public access (recommended for security)
     - Allow public read access if you want images to be directly accessible
6. Enable bucket versioning if needed
7. Click **Create bucket**

## Step 2: Configure CORS (Cross-Origin Resource Sharing)

1. Select your newly created bucket
2. Go to the **Permissions** tab
3. Scroll down to the **Cross-origin resource sharing (CORS)** section
4. Click **Edit** and add the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

5. Replace `https://yourdomain.com` with your production domain
6. Click **Save changes**

## Step 3: Create IAM User for API Access

1. Open the IAM console at https://console.aws.amazon.com/iam/
2. In the navigation pane, choose **Users** and then **Add users**
3. Enter a user name (e.g., `dump-anything-app`)
4. Select **Access key - Programmatic access**
5. Click **Next: Permissions**
6. Choose **Attach existing policies directly**
7. Create a new policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

8. Replace `your-bucket-name` with your actual bucket name
9. Click **Next: Tags** (optional)
10. Click **Next: Review**
11. Click **Create user**
12. **Important**: Save the Access key ID and Secret access key. You will not be able to see the secret key again.

## Step 4: Update Environment Variables

Update your `.env.local` file with the following values:

```
AWS_REGION="your-selected-region"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## Step 5: Bucket Policy (Optional - For Public Access)

If you want to make all objects in your bucket publicly readable:

1. Go to your bucket's **Permissions** tab
2. Click on **Bucket Policy**
3. Add the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Replace `your-bucket-name` with your actual bucket name
5. Click **Save changes**

## Security Considerations

1. Never commit your AWS credentials to version control
2. Use environment variables to store sensitive information
3. Consider using AWS IAM roles for production environments
4. Implement proper access controls for your S3 bucket
5. Consider setting up a CDN like CloudFront for better performance and security

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html) 