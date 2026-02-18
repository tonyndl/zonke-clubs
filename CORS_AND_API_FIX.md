# CORS and API Fixes

## Issues Fixed

### 1. CORS Configuration

**Problem**: Browser was sending OPTIONS preflight requests that weren't being handled, causing "no route found for OPTIONS" errors.

**Solution**: Added Corsica CORS middleware to [endpoint.ex](backend/lib/backend_web/endpoint.ex:56-60)

```elixir
plug Corsica,
  origins: "*",
  allow_headers: :all,
  allow_methods: :all,
  allow_credentials: true
```

### 2. Frontend API Endpoints

**Problem**: Frontend was using wrong endpoints:

- Signup: `/api/accounts` (incorrect)
- Login: `/api/session/current_session` (incorrect)

**Solution**: Updated [api.ts](frontend/zonke-clubs-admin/src/services/api.ts) to use correct admin endpoints:

- Signup: `/admin/register`
- Login: `/admin/login`

### 3. Request/Response Structure

**Problem**: Frontend was sending wrong data structure and expecting wrong response format.

**Solution**:

- Updated signup to send: `{name, email, password, role}`
- Updated to expect JWT field as `jwt` not `token`
- Updated TypeScript types to match backend response

### 4. Guardian JWT Support

**Problem**: Guardian didn't know how to encode Admin structs, causing FunctionClauseError.

**Solution**: Added Admin pattern matching to [guardian.ex](backend/lib/backend/guardian/guardian.ex:9-12)

```elixir
def subject_for_token(%Admin{id: id}, _claims) do
  {:ok, "Admin:#{id}"}
end
```

### 5. Registration JWT Response

**Problem**: Registration endpoint only returned admin object without JWT token.

**Solution**: Updated [admin_controller.ex](backend/lib/backend_web/controllers/admin/admin_controller.ex:13-18) to generate JWT on registration and added `show_with_token` to AdminJSON view.

## Testing

All endpoints now working correctly:

### Registration

```bash
curl -X POST http://localhost:4000/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Admin", "email": "test@example.com", "password": "password123", "role": "club_admin"}'

# Returns:
{
  "admin": {
    "id": "...",
    "name": "Test Admin",
    "email": "test@example.com",
    "role": "club_admin",
    "active": true,
    ...
  },
  "jwt": "eyJhbGciOiJIUzUxMiIs..."
}
```

### Login

```bash
curl -X POST http://localhost:4000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Returns same structure as registration
```

## Frontend Usage

The frontend Auth component should now work correctly. The flow is:

1. User fills in signup/login form
2. Frontend calls `apiService.signup()` or `apiService.login()`
3. Backend returns `{admin, jwt}`
4. Frontend stores JWT in localStorage as `auth_token`
5. Frontend navigates to appropriate page

## Next Steps

1. Test the frontend signup/login forms
2. Implement token refresh or expiration handling
3. Add role-based access control for different admin types
4. Consider adding "Remember Me" functionality
5. Implement password reset flow
