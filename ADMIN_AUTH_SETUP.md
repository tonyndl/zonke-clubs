# Admin Authentication System

The club admin authentication system is now implemented as a separate system from regular user authentication.

## Backend Structure

### 1. Admin Context (`lib/backend/admin/`)

- **admin.ex** - Admin schema with email-based authentication
- **admins.ex** - Admin context functions (get, update, password verification)
- **registration.ex** - Admin registration logic
- **session.ex** - Admin login/authentication logic

### 2. Controllers (`lib/backend_web/controllers/admin/`)

- **admin_controller.ex** - Registration, profile, password management
- **session_controller.ex** - Login endpoint

### 3. JSON Views (`lib/backend_web/controllers/json/admin/`)

- **admin_json.ex** - Admin data serialization
- **session_json.ex** - Login response (admin + JWT)

### 4. Database

- **admins** table with UUID primary keys
- Fields: email, name, phone, password_hash, role, avatar_url, active
- Unique constraint on email

## API Endpoints

### Public Endpoints

```
POST /admin/register
Body: {
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name",
  "role": "club_admin"  // or "super_admin"
}
Response: { "id": "...", "email": "...", "name": "...", ... }

POST /admin/login
Body: {
  "email": "admin@example.com",
  "password": "password123"
}
Response: {
  "admin": { "id": "...", "email": "...", "name": "...", ... },
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (require JWT token)

```
GET /admin/profile
Headers: { "Authorization": "Bearer <jwt>" }
Response: { "id": "...", "email": "...", "name": "...", ... }

PUT /admin/profile
Headers: { "Authorization": "Bearer <jwt>" }
Body: { "name": "New Name", "phone": "+1234567890" }
Response: { "id": "...", "email": "...", "name": "...", ... }

PUT /admin/profile/password
Headers: { "Authorization": "Bearer <jwt>" }
Body: {
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
Response: { "message": "Password changed successfully" }
```

## Key Features

1. **Separate from User Auth** - Completely isolated in `/admin` namespace
2. **Email-based Login** - Uses email instead of username
3. **Role Support** - `club_admin` or `super_admin`
4. **Active Status** - Accounts can be deactivated (active: false)
5. **Password Security** - Bcrypt hashing with minimum 8 characters
6. **JWT Authentication** - Same Guardian system as users, but separate routes

## Error Responses

- **401 Unauthorized** - Invalid credentials or missing token
- **403 Forbidden** - Account deactivated
- **422 Unprocessable Entity** - Validation errors (duplicate email, weak password, etc.)

## Next Steps

To implement the frontend:

1. Create login/register forms in the admin web app
2. Store JWT token in localStorage/cookies
3. Add Authorization header to all API requests
4. Implement token refresh or re-login on expiration
5. Add role-based access control for different admin types
