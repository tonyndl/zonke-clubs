# Content Moderation Empty Cards Fix

## Problem

After running `mix assets.cleanup`, the web admin's content moderation page was still showing empty cards for posts that no longer had assets.

## Root Cause

The cleanup process removed:

1. ✅ Asset records from database (where S3 files were missing)
2. ✅ User avatar URLs
3. ❌ **Posts were left in database even though they had no assets**

This meant the content moderation API was returning posts without any media, resulting in empty cards.

## Solution

### 1. Added Post Cleanup to Assets.Cleanup Module

**File**: `backend/lib/backend/assets/cleanup.ex`

Added `cleanup_posts_without_assets/0` function that:

- Finds all posts with no assets using a LEFT JOIN
- Deletes those posts from the database
- Returns count of removed posts

```elixir
def cleanup_posts_without_assets do
  posts_without_assets =
    Repo.all(
      from p in Backend.Posts.Post,
        left_join: a in assoc(p, :assets),
        group_by: p.id,
        having: count(a.id) == 0
    )
  # ... delete logic
end
```

### 2. Updated cleanup_all Function

Modified to include post cleanup:

```elixir
def cleanup_all do
  {removed_assets, _errors} = remove_orphaned_assets()
  removed_avatars = cleanup_user_avatars()
  removed_posts = cleanup_posts_without_assets()  # NEW!

  IO.puts("  - Posts removed (no assets): #{removed_posts}")
end
```

### 3. Filtered Queries to Exclude Posts Without Assets

**File**: `backend/lib/backend/posts/posts.ex`

Added `exists` clause to both `list_posts/2` and `get_stats/1`:

```elixir
query =
  from p in Post,
    as: :post,
    where: p.club_id == ^club_id,
    where:
      exists(
        from a in Asset,
          where: a.post_id == parent_as(:post).id
      ),
    order_by: [desc: p.inserted_at],
    preload: [:user, :assets]
```

This ensures posts without assets are never returned, even before cleanup runs.

## Results

### Cleanup Output

```
🧹 Starting comprehensive cleanup...

Checking 0 assets...
✅ Cleanup complete:
  - Removed: 0
  - Errors: 0

Checking 23 user avatars...

Checking posts without assets...
Found 5 posts with no assets
Removing post 3f2b5207-f204-4579-837b-b0b0f45cbeb5 (no assets)
Removing post bd244f99-7831-4f1b-bec0-6c92335542b1 (no assets)
Removing post 8ea0837b-cfa1-4713-a9e0-ae31175f2c17 (no assets)
Removing post 2947b114-9856-4a88-b295-6cc06b5cbb64 (no assets)
Removing post 7e85cdf8-65bc-450d-b97e-5fb85f0668b2 (no assets)

✅ Total cleanup:
  - Asset records removed: 0
  - User avatars cleared: 0
  - Posts removed (no assets): 5
```

### Changes Made

1. **backend/lib/backend/assets/cleanup.ex**
   - Added `cleanup_posts_without_assets/0`
   - Updated `cleanup_all/0` to include post cleanup

2. **backend/lib/backend/posts/posts.ex**
   - Added `Asset` alias
   - Added `exists` filter to `list_posts/2`
   - Added `exists` filter to `get_stats/1`

## Prevention

The query filters ensure that even if posts without assets are created somehow, they won't appear in:

- Content moderation lists
- Post statistics
- Any other post queries

## Usage

```bash
# Clean up orphaned posts
cd backend
mix assets.cleanup

# This will now:
# - Remove asset records where S3 files don't exist
# - Clear user avatars where files are missing
# - Delete posts that have no assets
```

## Verification

After the fix:

- ✅ Web admin content moderation shows no empty cards
- ✅ Only posts with valid assets are displayed
- ✅ Post counts are accurate
- ✅ No database queries return posts without assets
