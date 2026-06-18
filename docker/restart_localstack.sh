#!/bin/bash

echo "🛑 Stopping LocalStack..."
docker-compose down

echo "🚀 Starting LocalStack with CORS support..."
docker-compose up -d

echo "⏳ Waiting for LocalStack to be ready..."
sleep 5

echo "✅ LocalStack restarted successfully!"
echo "📡 CORS is now configured for video streaming"
echo ""
echo "To verify CORS:"
echo "  AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3api get-bucket-cors --bucket zonke-clubs-bucket"
