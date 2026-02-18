# Location Feature Setup Guide

This guide explains how to set up and use the location feature for clubs and users in the Zonke Clubs application.

## Overview

The location feature allows:

- **Users**: To optionally set their location during profile setup and editing
- **Clubs**: To have structured location data with coordinates (required field)

Location data is stored as JSON/map with the following structure:

```json
{
  "name": "Cape Town, Western Cape, South Africa",
  "latitude": -33.9249,
  "longitude": 18.4241
}
```

## Backend Setup

### 1. Get Geoapify API Key

1. Sign up at [https://www.geoapify.com/](https://www.geoapify.com/)
2. Create a new project in your dashboard
3. Generate an API key
4. Free tier includes **3,000 requests per day** (sufficient for development and small-scale production)

### 2. Configure Environment Variable

Add your API key to the backend environment:

```bash
# backend/.env (or your environment configuration)
GEOAPIFY_API_KEY=your-geoapify-api-key-here
```

For production, set this as an environment variable in your deployment platform.

### 3. Install Dependencies

The backend uses the `Req` HTTP client (already included in `mix.exs`):

```bash
cd backend
mix deps.get
```

### 4. Run Database Migrations

Apply the migrations to add location fields and update existing data:

```bash
cd backend
mix ecto.migrate
```

**What the migrations do:**

- Add `location` field (map/jsonb) to `users` table (optional)
- Convert `clubs.location` from text to map/jsonb
- Existing club location strings are automatically converted to `%{name: "original_value"}`

### 5. Verify Backend Setup

Test the location search endpoint:

```bash
curl "http://localhost:4000/api/locations/search?q=Cape"
```

Expected response:

```json
{
  "locations": [
    {
      "name": "Cape Town, Western Cape, South Africa",
      "latitude": -33.9249,
      "longitude": 18.4241
    }
  ]
}
```

## Frontend Setup

No additional configuration needed! The frontend automatically uses the backend proxy endpoint.

### Key Components

1. **LocationPicker Component**: `frontend/zonke-clubs/components/ui/LocationPicker.tsx`
   - Reusable location search and selection component
   - Features: debounced search, loading indicator, suggestions dropdown
   - Used in Profile Setup and Profile Edit screens

2. **Location Service**: `frontend/zonke-clubs/services/locationService.ts`
   - Handles API calls to backend location endpoint
   - Returns location suggestions as typed objects

## Usage

### For Users (Club Goers)

**During Onboarding (Profile Setup):**

1. After filling bio and selecting vibes, users see a location section
2. Type at least 3 characters to search
3. Select from suggestions or skip (location is optional)

**Editing Profile:**

1. Go to Profile → Info tab
2. Find the Location section
3. Search and select a new location, or clear existing location

### For Club Owners/Admins

When setting up or editing a club:

1. Location field is **required**
2. Use the LocationPicker to search for the club's address
3. Select from suggestions (includes coordinates automatically)

## Data Structure

### User Location (Optional)

```typescript
location?: {
  name: string;
  latitude: number;
  longitude: number;
}
```

### Club Location (Required)

```typescript
location: {
  name: string;
  latitude: number;
  longitude: number;
}
```

## Migration Notes

### Existing Clubs

Clubs with string locations are automatically converted during migration:

**Before:**

```elixir
location: "Cape Town"
```

**After:**

```elixir
location: %{name: "Cape Town"}
```

Note: Existing clubs will only have the `name` field initially (no coordinates). To get coordinates, club owners should:

1. Edit their club
2. Re-select the location using the LocationPicker
3. Save to update with full location data

### Rollback

If needed, the migration can be rolled back:

```bash
mix ecto.rollback --step 2
```

This will:

1. Revert clubs.location from map back to text
2. Remove users.location field

## API Reference

### Location Search Endpoint

**Endpoint:** `GET /api/locations/search`

**Query Parameters:**

- `q` (required): Search query (minimum 3 characters)

**Response:**

```json
{
  "locations": [
    {
      "name": "Full formatted address",
      "latitude": -33.9249,
      "longitude": 18.4241
    }
  ]
}
```

**Features:**

- Public endpoint (no authentication required)
- 400ms debounce recommended on frontend
- Maximum 5 results per query
- Returns empty array for queries < 3 characters

## Troubleshooting

### Location Search Not Working

1. **Check API Key:**

   ```bash
   # In backend directory
   mix run -e "IO.inspect(Application.get_env(:backend, :geoapify_api_key))"
   ```

2. **Check Geoapify API Status:**
   - Visit [https://status.geoapify.com/](https://status.geoapify.com/)
   - Check your API key usage in Geoapify dashboard

3. **Check Network:**
   ```bash
   # Test Geoapify API directly
   curl "https://api.geoapify.com/v1/geocode/autocomplete?text=Cape&apiKey=YOUR_KEY&limit=5"
   ```

### Migration Issues

**Error: "column location cannot be cast automatically"**

This can happen if there's unexpected data in the location column. Run:

```sql
-- Check current location data
SELECT id, name, location FROM clubs LIMIT 10;

-- Manually fix problematic entries if needed
UPDATE clubs SET location = '{"name": "' || location || '"}' WHERE location IS NOT NULL;
```

### Frontend Type Errors

If you see TypeScript errors about location types:

1. Ensure `clubsService.ts` has the correct Club type
2. Check that all components accessing `club.location` use `club.location.name`
3. Restart TypeScript server in your IDE

## Performance Considerations

### API Rate Limits

Geoapify free tier: 3,000 requests/day

**Optimizations in place:**

- 400ms debounce on frontend (reduces API calls)
- Minimum 3 characters before search (prevents excessive queries)
- 5 results maximum per query

**Monitoring usage:**
Check your Geoapify dashboard for daily request counts.

### Database Performance

Location data is stored as JSONB in PostgreSQL:

- Efficient storage
- Fast queries
- No additional indexes needed for basic operations

**Future optimization:**
If you need location-based queries (find nearby clubs), consider:

1. Adding PostGIS extension
2. Creating spatial indexes
3. Implementing distance calculations

## Future Enhancements

Potential features to add:

- **Distance-based search**: Find clubs near user's location
- **Map integration**: Display clubs on an interactive map
- **Location autocomplete**: Improve UX with instant suggestions
- **Geofencing**: Notify users about nearby clubs
- **Analytics**: Track popular locations

## Support

For issues or questions:

- Check backend logs: `tail -f backend/_build/dev/lib/backend/ebin/*.log`
- Check frontend console in browser dev tools
- Review Geoapify API documentation: [https://www.geoapify.com/geocoding-api](https://www.geoapify.com/geocoding-api)
