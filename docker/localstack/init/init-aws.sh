#!/bin/bash

echo "🚀 Initializing LocalStack S3..."

# Create bucket if it doesn't exist
awslocal s3 mb s3://zonke-clubs-bucket 2>/dev/null || echo "Bucket already exists"

# Configure CORS for video streaming support
echo "📡 Configuring CORS for video streaming..."
awslocal s3api put-bucket-cors --bucket zonke-clubs-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "ETag",
        "Content-Length",
        "Content-Type",
        "Accept-Ranges",
        "Content-Range"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}'

echo "✅ S3 bucket 'zonke-clubs-bucket' ready with CORS enabled"
echo "🎥 Video streaming support enabled!"
