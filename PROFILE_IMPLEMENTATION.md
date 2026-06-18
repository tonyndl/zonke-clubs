# Profile Screen Implementation

This document explains how the profile screen has been updated to display authenticated user information.

## Changes Made

### 1. Updated Profile Screen

**File**: `frontend/zonke-clubs/app/(tabs)/profile.tsx`

The profile screen now:

- ✅ Fetches and displays **real authenticated user data** from `AuthContext`
- ✅ Shows user's **first name, last name, email/username, and role**
- ✅ Displays a **loading state** while authentication is loading
- ✅ Shows **"Please log in"** message if user is not authenticated
- ✅ Includes a **logout button** in the header
- ✅ Displays user info chips showing email and role

### Key Features

#### Authentication Integration

```typescript
const { user: authUser, isLoading: authLoading, logout } = useAuth();
```

The screen uses the `useAuth` hook to:

- Get the currently logged-in user
- Check if authentication is still loading
- Access the logout function

#### User Information Display

**Name Display**:

```typescript
name: `${authUser.first_name} ${authUser.last_name}`;
```

**Email/Username Chip**:

- Shows email if available, otherwise shows username
- Displayed with mail icon

**Role Badge**:

- Shows "Club Owner" or "Club Goer" based on user role
- Displayed with shield icon in gold color

#### Loading States

**1. Loading Authentication**:

```typescript
if (authLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.gold} />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  );
}
```

**2. Not Authenticated**:

```typescript
if (!authUser && isOwnProfile) {
  return (
    <View style={styles.loadingContainer}>
      <Ionicons name="person-circle-outline" size={80} color={Colors.lightGrey} />
      <Text style={styles.notAuthText}>Please log in to view your profile</Text>
      <PressableScale onPress={() => router.push('/screens/Login')}>
        <Text style={styles.loginButtonText}>Go to Login</Text>
      </PressableScale>
    </View>
  );
}
```

#### Logout Functionality

**Logout Button** (top-right corner):

```typescript
<PressableScale onPress={handleLogout} style={styles.logoutButton}>
  <Ionicons name="log-out-outline" size={24} color={Colors.gold} />
</PressableScale>
```

**Logout Handler**:

```typescript
const handleLogout = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  logout()
    .then(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setToastMessage("Logged out successfully");
      setToastType("success");
      setToastVisible(true);
      setTimeout(() => {
        router.replace("/screens/Login");
      }, 500);
    })
    .catch((error) => {
      console.error("Logout error:", error);
      // Show error toast
    });
};
```

### 2. Updated User Interface

**File**: `frontend/zonke-clubs/services/authService.ts`

Added optional profile fields to the User interface:

```typescript
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  inserted_at: string;
  updated_at: string;
  // Optional profile fields (not yet in backend schema)
  bio?: string;
  favoriteDrinks?: string[];
  vibes?: string[];
  favoriteClubIds?: string[];
}
```

These optional fields allow the profile screen to work with both:

- Current backend schema (without extended profile data)
- Future backend schema (with bio, drinks, vibes, etc.)

## Profile Screen Layout

```
┌─────────────────────────────────────┐
│  [←]       Profile         [Logout] │
├─────────────────────────────────────┤
│                                     │
│           [Avatar Image]            │
│              [Camera]               │
│                                     │
│          John Doe                   │
│      📧 john@example.com            │
│      🛡️ Club Goer                   │
│                                     │
├─────────────────────────────────────┤
│  [Info] [Club Feed] [Beer Stats]   │
├─────────────────────────────────────┤
│                                     │
│  Bio Section                        │
│  Favorite Drinks                    │
│  My Vibe                            │
│  Favourite Clubs                    │
│                                     │
└─────────────────────────────────────┘
```

## Data Flow

```
User Logs In
    ↓
AuthContext.login()
    ↓
authService.login()
    ↓
Save JWT + User to SecureStore
    ↓
Update user state in AuthContext
    ↓
Profile Screen reads from AuthContext
    ↓
Display user information
```

## User Experience

### On First Load

1. Screen shows loading spinner
2. AuthContext checks for saved JWT
3. If JWT exists, loads user data
4. Profile screen displays user info

### If Not Logged In

1. Shows "Please log in" message
2. Displays login button
3. Redirects to login screen on button press

### After Successful Login

1. User data appears immediately
2. Shows:
   - Full name (first + last name)
   - Email or username
   - Role badge (Club Owner/Club Goer)
   - Avatar (default image for now)
   - Logout button

### On Logout

1. User taps logout button
2. Shows success toast
3. Clears JWT from SecureStore
4. Redirects to login screen

## Styling Highlights

**User Info Chips**:

- Subtle background with border
- Icon + text layout
- Responsive to content

**Role Badge**:

- Gold color to match theme
- Shield icon for authority
- Clear role identification

**Logout Button**:

- Positioned in top-right corner
- Icon-only for clean UI
- Matches app theme

**Loading States**:

- Centered spinner
- Descriptive text
- Consistent with app design

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Verify profile shows correct name
- [ ] Verify email/username displays
- [ ] Verify role badge shows correctly
- [ ] Test logout button
- [ ] Verify redirect to login after logout
- [ ] Test loading state (slow connection)
- [ ] Test not-authenticated state
- [ ] Verify avatar displays (default image)
- [ ] Test navigation between tabs

## Future Enhancements

### Backend Schema Extensions

To fully support the profile screen features, add these fields to the users table:

```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN favorite_drinks TEXT[];
ALTER TABLE users ADD COLUMN vibes TEXT[];
ALTER TABLE users ADD COLUMN favorite_club_ids UUID[];
```

### Backend Context Updates

**File**: `backend/lib/backend/accounts/user.ex`

```elixir
@optional_fields [:email, :phone, :bio, :avatar_url, :favorite_drinks, :vibes, :favorite_club_ids]
```

### API Endpoints for Profile Updates

```elixir
# Update profile with extended fields
def update_profile(%User{} = user, attrs) do
  user
  |> User.profile_changeset(attrs)
  |> Repo.update()
end
```

### Frontend Profile Editing

Once backend supports these fields:

- Allow users to edit bio
- Add/remove favorite drinks
- Select vibes
- Choose favorite clubs
- Upload avatar image

## Benefits of This Implementation

1. **Real User Data**: No more hardcoded mock data for own profile
2. **Secure Authentication**: Uses JWT stored in SecureStore
3. **Proper State Management**: Leverages React Context
4. **Loading States**: Professional UX with spinners and messages
5. **Error Handling**: Graceful handling of auth failures
6. **Logout Flow**: Clean logout with toast feedback
7. **Future-Ready**: Interface supports extended profile fields

## Related Files

- `frontend/zonke-clubs/contexts/AuthContext.tsx` - Auth state management
- `frontend/zonke-clubs/services/authService.ts` - Auth API calls
- `frontend/zonke-clubs/services/api.ts` - HTTP client with JWT injection
- `backend/lib/backend/accounts/user.ex` - User schema
- `backend/lib/backend_web/controllers/api/user_controller.ex` - User endpoints
- `backend/lib/backend_web/controllers/json/api/user_json.ex` - User JSON serialization

## Summary

The profile screen now displays real, authenticated user information from your zonke-clubs backend. Users can:

- View their profile information (name, email, role)
- See a loading state while auth is being checked
- Log out from the profile screen
- Be redirected to login if not authenticated

The implementation follows the zonke-drivers pattern and integrates seamlessly with the updated authentication system.
