# S3 Persistence Guide

This guide explains how to manage S3/LocalStack storage and prevent data loss.

## Problem We Solved

Previously, when LocalStack was restarted, all uploaded media files (avatars, posts) were lost because:

1. Files existed in the database but not in S3
2. No automatic cleanup of orphaned records
3. Users saw broken images

## Solutions Implemented

### 1. Automatic Cleanup Tool

A cleanup utility that removes orphaned database records when S3 files are missing.

**Usage:**

```bash
cd backend

# Clean up everything (assets + avatars)
mix assets.cleanup

# Only clean up asset records
mix assets.cleanup --assets

# Only clean up user avatars
mix assets.cleanup --avatars
```

**What it does:**

- Checks each asset record against S3
- Removes database records where files don't exist
- Clears user avatar URLs for missing avatars
- Shows summary of cleaned records

### 2. S3 Verification Script

A script to verify S3 is working correctly and test upload/download.

**Usage:**

```bash
cd docker
./verify_s3.sh
```

**What it checks:**

- LocalStack is running
- S3 bucket exists
- Persistence directory is configured
- Upload/download works correctly

### 3. Improved LocalStack Persistence

LocalStack now has proper persistence configured:

**Configuration:**

- **Container storage**: `/var/lib/localstack/data`
- **Host directory**: `./docker/localstack-data`
- **Persistence enabled**: `PERSISTENCE=1`

**How to maintain persistence:**

✅ **DO THIS** - Preserve data between restarts:

```bash
cd docker
docker-compose down           # Stops containers, keeps volumes
docker-compose up -d          # Starts containers with data intact
```

❌ **DON'T DO THIS** - Deletes all data:

```bash
docker-compose down -v        # The -v flag DELETES volumes!
```

## Daily Workflow

### Starting Development

1. Start LocalStack:

   ```bash
   cd docker
   docker-compose up -d
   ```

2. Verify S3 is working:

   ```bash
   ./verify_s3.sh
   ```

3. If files are missing, clean up orphaned records:
   ```bash
   cd ../backend
   mix assets.cleanup
   ```

### Stopping Development

**Always use** `docker-compose down` without the `-v` flag:

```bash
cd docker
docker-compose down  # ✅ Preserves S3 data
```

### After LocalStack Restart

If you accidentally lost S3 data:

1. Run cleanup to remove orphaned records:

   ```bash
   cd backend
   mix assets.cleanup
   ```

2. Users will need to re-upload their content:
   - Profile pictures
   - Posts

## Checking S3 Contents

List all files in S3:

```bash
cd docker
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
  aws --endpoint-url=http://localhost:4566 \
  s3 ls s3://zonke-clubs-bucket --recursive
```

Check if a specific file exists:

```bash
curl -I "http://192.168.1.139:4566/zonke-clubs-bucket/filename.jpg"
```

## Troubleshooting

### "Images not loading" on mobile app

1. Verify LocalStack is running:

   ```bash
   docker ps | grep localstack
   ```

2. Check if S3 bucket has files:

   ```bash
   cd docker
   ./verify_s3.sh
   ```

3. If bucket is empty, clean up orphaned records:

   ```bash
   cd backend
   mix assets.cleanup
   ```

4. Users need to re-upload content

### LocalStack won't start

1. Check logs:

   ```bash
   docker logs zonke-clubs-localstack
   ```

2. Restart LocalStack:

   ```bash
   cd docker
   docker-compose restart localstack
   ```

3. If still failing, recreate (will lose data):
   ```bash
   docker-compose down
   docker-compose up -d
   cd backend
   mix assets.cleanup  # Clean up orphaned records
   ```

### Persistence directory is empty

This means files were uploaded before persistence was configured or the directory was cleared.

**Solution:**

1. Run cleanup to remove orphaned records:

   ```bash
   cd backend
   mix assets.cleanup
   ```

2. Users re-upload content

3. Verify persistence is working:

   ```bash
   # Upload a test file
   cd docker
   ./verify_s3.sh

   # Restart LocalStack
   docker-compose restart localstack

   # Check if file still exists
   AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
     aws --endpoint-url=http://localhost:4566 \
     s3 ls s3://zonke-clubs-bucket
   ```

## Production Considerations

For production deployment, **DO NOT use LocalStack**. Instead:

1. Create an AWS S3 bucket
2. Set up IAM credentials with S3 access
3. Configure environment variables:

   ```bash
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_REGION="us-east-1"
   ```

4. The backend automatically uses real AWS S3 in production mode

## Files Created

- `backend/lib/backend/assets/cleanup.ex` - Cleanup module
- `backend/lib/mix/tasks/assets.cleanup.ex` - Mix task
- `docker/verify_s3.sh` - S3 verification script
- `docker/README.md` - Docker services documentation
- `S3_PERSISTENCE_GUIDE.md` - This guide

## Quick Reference

| Task                        | Command                              |
| --------------------------- | ------------------------------------ |
| Start LocalStack            | `cd docker && docker-compose up -d`  |
| Stop LocalStack (keep data) | `cd docker && docker-compose down`   |
| Verify S3                   | `cd docker && ./verify_s3.sh`        |
| Clean orphaned records      | `cd backend && mix assets.cleanup`   |
| List S3 files               | See "Checking S3 Contents" above     |
| View LocalStack logs        | `docker logs zonke-clubs-localstack` |
