# Authentication Implementation Guide

This document explains how the authentication system has been implemented following the zonke-drivers pattern.

## Summary of Changes

The authentication system has been updated to match the zonke-drivers repository pattern with the following key improvements:

### Backend Changes

#### 1. Session Returns `jwt` Instead of `token`

**File**: `backend/lib/backend/accounts/session.ex`

- Changed return value from `{:ok, %{user: user, token: token}}` to `{:ok, %{user: user, jwt: jwt}}`
- Added support for both string and atom keys in params
- Improved error handling with consistent `:invalid_credentials` response

```elixir
def authenticate(%{"username" => username, "password" => password}) do
  # Returns {:ok, %{user: user, jwt: jwt}}
end
```

#### 2. Updated SessionJSON

**File**: `backend/lib/backend_web/controllers/json/api/session_json.ex`

- Changed to return `jwt` field instead of `token`
- Matches zonke-drivers response format

```elixir
def show(%{session: %{user: user, jwt: jwt}}) do
  %{
    user: UserJSON.show(%{user: user}),
    jwt: jwt
  }
end
```

#### 3. Added Invalid Credentials Handler

**File**: `backend/lib/backend_web/controllers/fallback_controller.ex`

- Added specific handler for `:invalid_credentials` error
- Returns 401 Unauthorized with clear error message

### Frontend Changes

#### 1. Installed expo-secure-store

**Package**: `expo-secure-store`

- Secure token storage for native platforms
- Falls back to localStorage for web
- More secure than AsyncStorage

#### 2. Updated authService

**File**: `frontend/zonke-clubs/services/authService.ts`

**Key Changes**:

- Uses `expo-secure-store` for secure token storage
- Token key changed from `'auth_token'` to `'my_jwt'` (matching zonke-drivers)
- Returns `jwt` field instead of `token`
- Platform-specific storage (SecureStore for native, localStorage for web)
- Better error messages with proper error propagation
- Connected with API client for automatic token injection

**Storage Helpers**:

```typescript
export const getItem = (key: string): Promise<string | null>
export const setItem = (key: string, value: string): Promise<void>
export const deleteItem = (key: string): Promise<void>
```

#### 3. Updated API Client

**File**: `frontend/zonke-clubs/services/api.ts`

**Key Changes**:

- Removed AsyncStorage dependency
- Added `setTokenGetter` function to avoid circular dependency
- Improved error handling with better error messages
- Removed automatic token clearing (handled by AuthContext)
- Added `.catch()` fallback for error responses

**Token Injection**:

```typescript
// authService sets the token getter
setTokenGetter(() => authService.getToken());
```

#### 4. Updated AuthContext

**File**: `frontend/zonke-clubs/contexts/AuthContext.tsx`

**Key Changes**:

- Automatic login after successful registration
- Better logging for debugging
- Improved error handling with unauthorized detection
- Simplified state management

**Registration Flow**:

```typescript
register(data) -> authService.register(data) -> auto login() -> setUser()
```

## Authentication Flow

### Registration Flow

```
1. User submits registration form
2. AuthContext.register() called
3. authService.register() creates user account
4. On success, auto-login with username/password
5. authService.login() authenticates and gets JWT
6. JWT and user data saved to secure storage
7. User state updated in AuthContext
8. User is now authenticated
```

### Login Flow

```
1. User submits login form
2. AuthContext.login() called
3. authService.login() posts to /api/login
4. Backend validates credentials
5. Backend returns {user, jwt}
6. JWT and user saved to secure storage
7. User state updated in AuthContext
8. User is now authenticated
```

### Token Management

```
1. API requests check if authentication required
2. If yes, getTokenGetter() retrieves JWT from secure storage
3. JWT added to Authorization header: "Bearer <jwt>"
4. Request sent to backend
5. Backend validates JWT via Guardian
6. If valid, request proceeds
7. If invalid (401/403), error thrown
```

## Network Configuration

### Backend

**File**: `backend/config/dev.exs`

```elixir
http: [ip: {0, 0, 0, 0}, port: 4000]
```

- Listens on all network interfaces (not just localhost)
- Allows mobile devices to connect

**File**: `backend/config/runtime.exs`

```elixir
if config_env() == :dev do
  config :backend, BackendWeb.Endpoint,
    http: [ip: {0, 0, 0, 0}, port: String.to_integer(System.get_env("PORT", "4000"))]
end
```

- Preserves IP binding in dev mode

### Frontend

**File**: `frontend/zonke-clubs/services/api.ts`

```typescript
const LOCAL_IP = "192.168.1.139";

const getApiUrl = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return `http://${LOCAL_IP}:4000/api`;
  }
  return "http://localhost:4000/api";
};
```

- Uses local network IP for mobile devices
- Uses localhost for web

## Testing the Implementation

### 1. Start Backend Server

```bash
cd /home/tony/zonke-clubs/backend
sudo pkill -9 -f "mix phx.server"  # Stop any existing server
mix phx.server
```

### 2. Verify Backend is Accessible

```bash
# Should show 0.0.0.0:4000
ss -tlnp | grep 4000

# Test from network
curl http://192.168.1.139:4000/api/register
```

### 3. Start Frontend

```bash
cd /home/tony/zonke-clubs/frontend/zonke-clubs
npm start
```

### 4. Test on Mobile Device

1. Open app on physical device (must be on same WiFi)
2. Check Metro console for: `API URL configured: http://192.168.1.139:4000/api Platform: ios/android`
3. Try registration with:
   - First name
   - Last name
   - Username
   - Password
   - Role (club_goer or club_owner)
4. Should automatically log in after registration
5. Check SecureStore has JWT token

### 5. Debugging

**Backend Logs**:

```bash
# Watch backend logs
cd /home/tony/zonke-clubs/backend
mix phx.server
```

**Frontend Logs**:

- Metro bundler console shows all console.log outputs
- Look for:
  - "API URL configured: ..."
  - "Registration successful: ..."
  - "Login successful: ..."
  - "Auth data saved successfully"

**Common Issues**:

1. **Network request failed**
   - Backend not listening on 0.0.0.0
   - Phone not on same WiFi
   - Firewall blocking port 4000
   - Wrong LOCAL_IP in api.ts

2. **Invalid credentials**
   - Check backend logs for actual error
   - Verify username/password match

3. **Registration successful but not logged in**
   - Check AuthContext.register() auto-login logic
   - Verify backend returns correct user data

## Key Differences from Previous Implementation

| Aspect              | Before                | After                         |
| ------------------- | --------------------- | ----------------------------- |
| Token field name    | `token`               | `jwt`                         |
| Token storage       | AsyncStorage          | expo-secure-store             |
| Token key           | `'auth_token'`        | `'my_jwt'`                    |
| API token injection | Direct AsyncStorage   | Via setTokenGetter            |
| Registration flow   | Manual login required | Auto-login after registration |
| Network binding     | 127.0.0.1 only        | 0.0.0.0 (all interfaces)      |
| Error handling      | Basic                 | Improved with proper messages |

## Files Modified

### Backend

- `backend/lib/backend/accounts/session.ex`
- `backend/lib/backend_web/controllers/json/api/session_json.ex`
- `backend/lib/backend_web/controllers/fallback_controller.ex`
- `backend/config/dev.exs`
- `backend/config/runtime.exs`

### Frontend

- `frontend/zonke-clubs/services/authService.ts`
- `frontend/zonke-clubs/services/api.ts`
- `frontend/zonke-clubs/contexts/AuthContext.tsx`
- `frontend/zonke-clubs/package.json` (added expo-secure-store)

## Next Steps

1. **Restart backend** as your user (not root)
2. **Test registration** on mobile device
3. **Test login** with existing account
4. **Test logout** and token clearing
5. **Test profile refresh** with authenticated requests
6. **Create login/signup screens** following zonke-drivers UI pattern (if needed)

## Security Notes

- JWT tokens stored in SecureStore (encrypted on iOS, Keychain on iOS, EncryptedSharedPreferences on Android)
- Tokens automatically injected into authenticated requests
- Unauthorized responses (401/403) properly handled
- No sensitive data logged in production
- Password hashing handled by Bcrypt on backend
