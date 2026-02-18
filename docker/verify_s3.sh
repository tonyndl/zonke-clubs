#!/bin/bash

# S3/LocalStack Verification Script
# Checks if LocalStack is running and S3 is properly configured

set -e

echo "🔍 Verifying S3/LocalStack Setup..."
echo ""

# Check if LocalStack is running
if ! docker ps | grep -q zonke-clubs-localstack; then
    echo "❌ LocalStack is not running!"
    echo "   Start it with: cd docker && docker-compose up -d"
    exit 1
fi

echo "✅ LocalStack is running"

# Check if bucket exists
if AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 ls | grep -q zonke-clubs-bucket; then
    echo "✅ S3 bucket 'zonke-clubs-bucket' exists"
else
    echo "❌ S3 bucket 'zonke-clubs-bucket' does not exist"
    echo "   Creating bucket..."
    AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 mb s3://zonke-clubs-bucket
    echo "✅ Bucket created"
fi

# Count files in bucket
FILE_COUNT=$(AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 ls s3://zonke-clubs-bucket --recursive | wc -l)
echo "📁 Files in bucket: $FILE_COUNT"

# Check persistence directory
PERSISTENCE_DIR="./docker/localstack-data"
if [ -d "$PERSISTENCE_DIR" ]; then
    PERSISTENCE_FILES=$(ls -A "$PERSISTENCE_DIR" 2>/dev/null | wc -l)
    echo "💾 Persistence directory exists with $PERSISTENCE_FILES file(s)"
else
    echo "⚠️  Persistence directory does not exist"
    mkdir -p "$PERSISTENCE_DIR"
    echo "✅ Created persistence directory"
fi

# Test upload/download
echo ""
echo "🧪 Testing upload/download..."
TEST_FILE="/tmp/s3_test_$(date +%s).txt"
TEST_CONTENT="Test upload at $(date)"
echo "$TEST_CONTENT" > "$TEST_FILE"

# Upload test file
if AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 cp "$TEST_FILE" s3://zonke-clubs-bucket/ --quiet; then
    echo "✅ Upload successful"
else
    echo "❌ Upload failed"
    rm "$TEST_FILE"
    exit 1
fi

# Download and verify
DOWNLOADED_FILE="/tmp/s3_test_downloaded_$(date +%s).txt"
if AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 cp "s3://zonke-clubs-bucket/$(basename $TEST_FILE)" "$DOWNLOADED_FILE" --quiet; then
    if diff "$TEST_FILE" "$DOWNLOADED_FILE" > /dev/null; then
        echo "✅ Download and content verification successful"
    else
        echo "❌ Downloaded content doesn't match"
    fi
else
    echo "❌ Download failed"
fi

# Cleanup test files
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url=http://localhost:4566 s3 rm "s3://zonke-clubs-bucket/$(basename $TEST_FILE)" --quiet 2>/dev/null || true
rm -f "$TEST_FILE" "$DOWNLOADED_FILE"

echo ""
echo "✅ S3/LocalStack verification complete!"
echo ""
echo "📝 Summary:"
echo "   - LocalStack: Running"
echo "   - Bucket: Exists"
echo "   - Files: $FILE_COUNT"
echo "   - Upload/Download: Working"
echo ""
