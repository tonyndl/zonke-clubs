# Mobile App Authentication Implementation

## Overview

Complete authentication system integrated with the Phoenix backend API.

## Components Implemented

### 1. **API Service** ([services/api.ts](services/api.ts))

- Base API client using fetch
- Automatic JWT token management
- Auto-clears invalid tokens on 401/403
- Follows promise-based pattern (no async/await)

### 2. **Auth Service** ([services/authService.ts](services/authService.ts))

- `register(data)` - Register new user
- `login(data)` - Login and save token
- `logout()` - Clear auth data
- `getCurrentUser()` - Get cached user
- `getProfile()` - Fetch current user from API
- `updateProfile(data)` - Update user profile
- `isAuthenticated()` - Check if user is logged in

### 3. **AuthContext** ([contexts/AuthContext.tsx](contexts/AuthContext.tsx))

Global auth state management with hooks:

- `user` - Current user object
- `isLoading` - Auth check in progress
- `isAuthenticated` - Boolean auth status
- `login(data)` - Login function
- `register(data)` - Register and auto-login
- `logout()` - Logout function
- `refreshUser()` - Refresh user data from API

### 4. **Auth Screens**

- **Login** ([app/auth/login.tsx](app/auth/login.tsx))
  - Username/password fields
  - Loading states
  - Error handling
  - Link to registration

- **Register** ([app/auth/register.tsx](app/auth/register.tsx))
  - First name, last name, username, email
  - Password confirmation
  - Validation
  - Auto-login after registration

### 5. **App Layout** ([app/\_layout.tsx](app/_layout.tsx))

- Wraps app with AuthProvider
- Shows loading spinner during auth check
- Redirects to login if not authenticated
- Shows appropriate screens based on user role

## Usage Examples

### Using Auth in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout()
      .then(() => {
        console.log('Logged out');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  if (!isAuthenticated) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.first_name}!</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Adding Logout to Profile Screen

```typescript
// In app/(tabs)/profile.tsx, add:
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout()
              .then(() => {
                // User will be redirected to login automatically
              })
              .catch((error) => {
                Alert.alert('Error', 'Failed to logout');
              });
          },
        },
      ]
    );
  };

  return (
    <ScrollView>
      {/* Existing profile content */}

      {/* Add logout button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Making Authenticated API Calls

```typescript
import { api } from "@/services/api";

// Authenticated GET request
api
  .get("/profile", true)
  .then((user) => {
    console.log("User:", user);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Authenticated PUT request
api
  .put("/profile", { first_name: "John" }, true)
  .then((updatedUser) => {
    console.log("Updated:", updatedUser);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

## API Endpoints

### Public Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login and get JWT token

### Protected Endpoints (require Bearer token)

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile

## Backend Configuration

The mobile app connects to the backend at:

```
http://localhost:4000/api
```

To change the API URL, update [services/api.ts](services/api.ts):

```typescript
const API_URL = "http://YOUR_IP:4000/api"; // For physical devices
```

**Note:** For iOS simulator use `http://localhost:4000/api`, for Android emulator use `http://10.0.2.2:4000/api`, and for physical devices use your computer's IP address.

## Data Flow

1. **Registration/Login**
   - User submits credentials → Auth service → API
   - API returns user + JWT token
   - Token saved to AsyncStorage
   - User object saved to AsyncStorage
   - AuthContext updates state
   - App redirects to main screens

2. **Protected Requests**
   - Component calls API → API service gets token from AsyncStorage
   - Token added to Authorization header
   - Request sent to backend
   - If 401/403: Clear token, redirect to login
   - Otherwise: Return data

3. **Logout**
   - User clicks logout → Auth service clears AsyncStorage
   - AuthContext updates state
   - App redirects to login screen

## Security Notes

- ✅ JWT tokens stored in AsyncStorage (secure on device)
- ✅ Passwords never stored, only hashed on backend
- ✅ Auto-logout on invalid/expired tokens
- ✅ All sensitive endpoints require authentication
- ✅ Follows React Native best practices (no async/await, promise chains)

## Testing

1. Start the backend:

```bash
cd backend
mix phx.server
```

2. Start the mobile app:

```bash
cd frontend/zonke-clubs
npm start
```

3. Test flow:
   - Register new account
   - Login with credentials
   - View profile
   - Update profile
   - Logout
   - Login again

## Type Safety

All API responses are typed:

```typescript
interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  inserted_at: string;
  updated_at: string;
}
```

Backend uses snake_case, frontend matches exactly for consistency.
