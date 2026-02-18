# Zonke Clubs Backend

Phoenix/Elixir API backend for Zonke Clubs.

## Quick Start

1. **Install dependencies:**

   ```bash
   mix deps.get
   ```

2. **Start LocalStack (S3):**

   ```bash
   cd ../docker
   docker-compose up -d
   cd ../backend
   ```

3. **Verify S3 is working:**

   ```bash
   mix s3.health_check
   ```

4. **Setup database:**

   ```bash
   mix ecto.setup
   ```

5. **Start Phoenix server:**
   ```bash
   mix phx.server
   ```

Now visit [`localhost:4000`](http://localhost:4000) from your browser.

## Development Tools

### S3 Management

**Health check:**

```bash
mix s3.health_check              # Check S3 connection and file count
mix s3.health_check --cleanup    # Check + clean up orphaned records
```

**Cleanup orphaned assets:**

```bash
mix assets.cleanup               # Clean all orphaned assets and avatars
mix assets.cleanup --assets      # Only clean asset records
mix assets.cleanup --avatars     # Only clean user avatars
```

**Verify S3 setup:**

```bash
cd ../docker
./verify_s3.sh
```

### Database

**Reset database:**

```bash
mix ecto.reset
```

**Run migrations:**

```bash
mix ecto.migrate
```

**Seed data:**

```bash
mix run priv/repo/seeds.exs
```

## Important Notes

### S3/LocalStack Data Persistence

- LocalStack stores data in `../docker/localstack-data`
- Always use `docker-compose down` (NOT `docker-compose down -v`)
- The `-v` flag deletes volumes and S3 data
- If S3 data is lost, run `mix assets.cleanup` to remove orphaned records

See [S3_PERSISTENCE_GUIDE.md](../S3_PERSISTENCE_GUIDE.md) for details.

### Production Deployment

For production, configure real AWS S3 credentials:

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"
```

The backend automatically uses AWS S3 in production mode.

## Resources

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix
