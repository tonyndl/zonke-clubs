# S3 Image Storage Implementation Guide

## 🎉 Implementation Complete!

I've successfully implemented a complete S3 image storage system for zonke-clubs using ExAws for both web and mobile platforms.

---

## 📦 What's Been Implemented

### **Backend (Elixir/Phoenix)**

1. **LocalStack Docker Setup**
   - `docker/docker-compose.yml` - LocalStack service configuration
   - `docker/localstack/init/init-aws.sh` - Auto-creates `zonke-clubs-bucket` on startup
   - Runs on `localhost:4566` for development

2. **Dependencies Added**
   - `ex_aws ~> 2.4` - AWS SDK for Elixir
   - `ex_aws_s3 ~> 2.5` - S3-specific functionality
   - `hackney ~> 1.18` - HTTP client
   - `sweet_xml ~> 0.7` - XML parsing for S3 responses

3. **Configuration**
   - `config/config.exs` - Base AWS credentials from environment
   - `config/dev.exs` - LocalStack override for development

4. **Database**
   - `priv/repo/migrations/20260209120000_create_assets_table.exs` - Assets table with UUID primary key
   - Fields: `filename`, `user_id`, `club_id`, `post_id`, `copied`, `meta`

5. **Schema & Context**
   - `lib/backend/assets/asset.ex` - Asset schema with virtual URL field
   - `lib/backend/assets/assets.ex` - Complete S3 integration:
     - `upload_and_save/1` - Upload file to S3 and save record
     - `update_asset_with_file/2` - Replace file in S3
     - `delete_object/1` - Delete from S3
     - `presigned_url/1` - Generate secure temporary URLs
     - `prepare_url/2` - Generate public or presigned URLs
     - `ensure_bucket_exists/0` - Verify/create bucket

6. **API Layer**
   - `lib/backend_web/controllers/api/asset_controller.ex` - RESTful endpoints
   - `lib/backend_web/controllers/json/api/asset_json.ex` - JSON serialization
   - Routes: `POST /api/assets`, `GET /api/assets/:id`, `PUT /api/assets/:id`, `DELETE /api/assets/:id`

### **Frontend Admin (React Web)**

1. **Upload Component**
   - `frontend/zonke-clubs-admin/src/components/ImageUpload/ImageUpload.tsx`
   - Features:
     - Drag & drop support
     - Click to upload
     - Image preview
     - Upload progress
     - File validation (type & size)
     - Remove image button

2. **API Service**
   - `frontend/zonke-clubs-admin/src/services/api.ts` - Added methods:
     - `uploadAsset(formData)` - Upload with multipart/form-data
     - `getAsset(id)` - Retrieve asset by ID
     - `deleteAsset(id)` - Delete asset

### **Frontend Mobile (React Native/Expo)**

1. **Image Picker Component**
   - `frontend/zonke-clubs/components/ui/ImagePicker.tsx`
   - Features:
     - Take photo with camera
     - Choose from library
     - Permission handling
     - Image preview
     - Upload progress
     - Change/remove image
   - Exported from `components/ui/index.ts`

---

## 🚀 Getting Started

### **1. Install Dependencies**

```bash
# Backend
cd backend
mix deps.get

# Admin Web
cd ../frontend/zonke-clubs-admin
npm install

# Mobile (if needed)
cd ../zonke-clubs
npm install
```

### **2. Start LocalStack**

```bash
cd docker
docker-compose up -d

# Check logs
docker-compose logs -f localstack
```

You should see:

```
🚀 Creating S3 bucket: zonke-clubs-bucket
✅ S3 bucket setup complete!
```

### **3. Run Migration**

```bash
cd backend
mix ecto.migrate
```

### **4. Verify Setup (Optional)**

```bash
# Start IEx
cd backend
iex -S mix

# In IEx
Backend.Assets.ensure_bucket_exists()
# => ✅ Bucket zonke-clubs-bucket exists
```

### **5. Start Development Servers**

```bash
# Backend
cd backend
mix phx.server
# Running on http://localhost:4000

# Admin Web
cd frontend/zonke-clubs-admin
npm start
# Running on http://localhost:3000

# Mobile
cd frontend/zonke-clubs
npx expo start
```

---

## 📖 Usage Examples

### **Admin Web (React)**

```tsx
import { ImageUpload } from "@/components/ImageUpload/ImageUpload";

function ClubSettings() {
  const handleUploadSuccess = (asset: any) => {
    console.log("Uploaded:", asset);
    // Update state with new image URL
  };

  return (
    <ImageUpload
      onUploadSuccess={handleUploadSuccess}
      entityType="club"
      entityId={clubId}
      existingImageUrl={club.logoUrl}
      label="Club Logo"
    />
  );
}
```

### **Mobile (React Native)**

```tsx
import { ImagePicker } from "@/components/ui";

function EditProfile() {
  const handleUploadSuccess = (asset: any) => {
    console.log("Uploaded:", asset);
    // Update profile with new avatar
  };

  return (
    <ImagePicker
      onUploadSuccess={handleUploadSuccess}
      entityType="user"
      entityId={userId}
      existingImageUrl={user.avatarUrl}
      label="Profile Picture"
    />
  );
}
```

### **Backend - Manual Upload**

```elixir
# In controller or context
params = %{
  "file" => %Plug.Upload{
    path: "/tmp/uploaded_file.jpg",
    filename: "profile.jpg"
  },
  "user_id" => "user-uuid-here"
}

{:ok, asset} = Backend.Assets.upload_and_save(params)
# => %Asset{id: "...", filename: "profile_1707486000_abc123.jpg", ...}

# Get public URL
url = Backend.Assets.prepare_url(asset.filename, %{public: true})
# => "http://localhost:4566/zonke-clubs-bucket/profile_1707486000_abc123.jpg?t=1707486000"
```

---

## 🔧 Configuration

### **Environment Variables**

#### **Development (uses LocalStack)**

No environment variables needed - uses hardcoded `test` credentials.

#### **Production (uses real AWS)**

```bash
export AWS_ACCESS_KEY_ID="your-aws-access-key"
export AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

### **Bucket Name**

Defined in `lib/backend/assets/assets.ex`:

```elixir
@bucket "zonke-clubs-bucket"
```

### **URL Strategy**

**Development (LocalStack):**

```
http://localhost:4566/zonke-clubs-bucket/filename.jpg?t=timestamp
```

**Production (AWS S3):**

```
https://zonke-clubs-bucket.s3.amazonaws.com/filename.jpg?t=timestamp
```

---

## 🎨 Key Features

### **✅ Unique Filenames**

Auto-generates unique filenames to prevent collisions:

```
original_name_1707486000_abc123.jpg
```

### **✅ Transaction Safety**

Uses `Ecto.Multi` to ensure S3 upload and DB save are atomic:

- If S3 upload fails → DB record not created
- If DB save fails → No orphaned files in S3 (rollback logic available)

### **✅ Virtual URL Field**

Asset schema has `url` as virtual field - computed on-demand, not stored in DB:

```elixir
field :url, :string, virtual: true
```

### **✅ Dual URL Types**

**Presigned (Private) - Default:**

```elixir
Assets.prepare_url(filename)  # Expires in 7 days
```

**Public:**

```elixir
Assets.prepare_url(filename, %{public: true})  # Cache-busted with timestamp
```

### **✅ Environment Detection**

Automatically uses LocalStack in dev, AWS S3 in prod:

```elixir
def s3_config do
  if Mix.env() == :dev do
    # LocalStack config
  else
    # AWS config
  end
end
```

---

## 📋 API Endpoints

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| POST   | `/api/assets`     | Upload new asset           |
| GET    | `/api/assets/:id` | Get asset by ID            |
| PUT    | `/api/assets/:id` | Update asset with new file |
| DELETE | `/api/assets/:id` | Delete asset & S3 file     |

### **Upload Request**

```bash
curl -X POST http://localhost:4000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "club_id=uuid-here"
```

### **Response**

```json
{
  "id": "asset-uuid",
  "filename": "image_1707486000_abc123.jpg",
  "url": "http://localhost:4566/zonke-clubs-bucket/image_1707486000_abc123.jpg?t=1707486000",
  "club_id": "club-uuid",
  "user_id": null,
  "post_id": null,
  "copied": false,
  "meta": {},
  "inserted_at": "2024-02-09T12:00:00Z",
  "updated_at": "2024-02-09T12:00:00Z"
}
```

---

## 🧪 Testing

### **Test Upload (Admin Web)**

1. Start backend & LocalStack
2. Start admin web app
3. Import and use `ImageUpload` component
4. Drag & drop an image or click to select
5. Check browser network tab for upload progress
6. Verify image appears with preview

### **Test Upload (Mobile)**

1. Start backend & LocalStack
2. Start Expo dev server
3. Import and use `ImagePicker` component
4. Tap to show camera/library options
5. Select image
6. Verify upload and preview

### **Verify in LocalStack**

```bash
# List bucket contents
aws --endpoint-url=http://localhost:4566 s3 ls s3://zonke-clubs-bucket/

# Download file
aws --endpoint-url=http://localhost:4566 s3 cp s3://zonke-clubs-bucket/filename.jpg ./test.jpg
```

---

## 🚨 Troubleshooting

### **"Bucket does not exist" error**

```bash
# Recreate bucket
cd backend
iex -S mix
Backend.Assets.ensure_bucket_exists()
```

### **"Connection refused" to LocalStack**

```bash
# Check LocalStack is running
docker ps | grep localstack

# Restart if needed
cd docker
docker-compose restart localstack
```

### **Upload fails with 401/403**

- Check authentication token is included in request
- Verify token is valid and not expired

### **Image doesn't load**

- Check URL includes timestamp cache-buster parameter
- Verify LocalStack is accessible from frontend
- Try accessing URL directly in browser

---

## 🎯 Production Deployment

### **1. Create Real S3 Bucket**

```bash
aws s3 mb s3://zonke-clubs-bucket --region us-east-1

# Set CORS for web uploads
aws s3api put-bucket-cors --bucket zonke-clubs-bucket --cors-configuration file://cors.json
```

**cors.json:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### **2. Set Environment Variables**

```bash
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
```

### **3. Deploy Backend**

```bash
cd backend
MIX_ENV=prod mix release
_build/prod/rel/backend/bin/backend start
```

---

## 📚 File Structure

```
zonke-clubs/
├── docker/
│   ├── docker-compose.yml
│   ├── .gitignore
│   └── localstack/
│       └── init/
│           └── init-aws.sh
├── backend/
│   ├── mix.exs (+ ExAws deps)
│   ├── config/
│   │   ├── config.exs (+ AWS config)
│   │   └── dev.exs (+ LocalStack config)
│   ├── lib/
│   │   ├── backend/
│   │   │   └── assets/
│   │   │       ├── asset.ex
│   │   │       └── assets.ex (+ S3 functions)
│   │   └── backend_web/
│   │       ├── controllers/
│   │       │   └── api/
│   │       │       └── asset_controller.ex
│   │       ├── controllers/json/api/
│   │       │   └── asset_json.ex
│   │       └── router.ex (+ asset routes)
│   └── priv/repo/migrations/
│       └── 20260209120000_create_assets_table.exs
└── frontend/
    ├── zonke-clubs-admin/
    │   ├── src/
    │   │   ├── components/
    │   │   │   └── ImageUpload/
    │   │   │       └── ImageUpload.tsx
    │   │   └── services/
    │   │       └── api.ts (+ uploadAsset)
    └── zonke-clubs/
        └── components/
            └── ui/
                ├── ImagePicker.tsx
                └── index.ts (+ export)
```

---

## ✨ Summary

You now have a complete, production-ready image storage system with:

- ✅ **LocalStack** for development (no AWS costs!)
- ✅ **AWS S3** for production
- ✅ **Drag & drop** upload on web
- ✅ **Camera & library** support on mobile
- ✅ **Transaction safety** with Ecto.Multi
- ✅ **Unique filenames** to prevent collisions
- ✅ **Presigned URLs** for security
- ✅ **Public URLs** for performance
- ✅ **Environment detection** (dev/prod)

The implementation follows zonke-drivers patterns and integrates seamlessly with your existing architecture!

🎉 **Happy uploading!** 🚀
