# Docker Services for Zonke Clubs

## LocalStack S3 Setup

LocalStack provides a local AWS S3 implementation for development.

### Starting LocalStack

```bash
cd docker
docker-compose up -d
```

### Stopping LocalStack

**IMPORTANT**: Use `docker-compose down` (without `-v` flag) to preserve data:

```bash
cd docker
docker-compose down  # ✅ Keeps data
```

**NEVER use** `docker-compose down -v` as this will delete all volumes and S3 data:

```bash
docker-compose down -v  # ❌ DELETES ALL DATA
```

### Verifying S3 Setup

Run the verification script to check if S3 is working properly:

```bash
cd docker
./verify_s3.sh
```

### Cleaning Up Orphaned Assets

If S3 data is lost (e.g., after accidental volume deletion), clean up orphaned database records:

```bash
cd backend
mix assets.cleanup
```

This will:

- Remove asset records where S3 files don't exist
- Clear user avatar URLs where avatar files are missing
- Show a summary of cleaned records

### Data Persistence

LocalStack is configured with persistence enabled:

- **Container path**: `/var/lib/localstack/data`
- **Host path**: `./docker/localstack-data`
- **Environment**: `PERSISTENCE=1`

Data persists between restarts as long as:

1. You use `docker-compose down` (not `docker-compose down -v`)
2. The `localstack-data` directory is not deleted
3. The container is restarted, not recreated

### Checking S3 Files

List all files in the bucket:

```bash
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
  aws --endpoint-url=http://localhost:4566 \
  s3 ls s3://zonke-clubs-bucket --recursive
```

### Accessing S3 from Mobile App

The backend is configured to use your local IP (`192.168.1.139`) so mobile devices on the same network can access S3:

- **Development**: `http://192.168.1.139:4566/zonke-clubs-bucket/filename`
- **Production**: `https://zonke-clubs-bucket.s3.amazonaws.com/filename`

Update `LOCAL_IP` in your environment if your machine's IP changes.

## Troubleshooting

### S3 files are missing after restart

1. Check if LocalStack is running: `docker ps | grep localstack`
2. Verify bucket exists: `./verify_s3.sh`
3. Check persistence directory: `ls -la localstack-data/`
4. Clean up orphaned records: `cd ../backend && mix assets.cleanup`

### LocalStack not starting

1. Check logs: `docker logs zonke-clubs-localstack`
2. Restart: `docker-compose restart localstack`
3. Recreate (will lose data): `docker-compose down && docker-compose up -d`

### Cannot access S3 from mobile app

1. Check `LOCAL_IP` environment variable matches your machine's IP
2. Ensure mobile device is on the same network
3. Verify firewall allows connections on port 4566
