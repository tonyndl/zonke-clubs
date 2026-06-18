# Mobile Network Connection Fix Guide

## Problem Summary

The mobile app couldn't connect to the backend because:

1. Backend was running as root with old configuration
2. Backend was only listening on localhost (127.0.0.1), not on the network
3. Frontend API URL detection needed improvement

## Files Modified

### Backend

1. **config/dev.exs** - Changed IP binding from `{127, 0, 0, 1}` to `{0, 0, 0, 0}`
2. **config/runtime.exs** - Added dev environment handling to preserve IP setting

### Frontend

3. **services/api.ts** - Updated to use Platform.OS instead of Constants.platform

## Steps to Fix

### 1. Stop the Root Backend Process

The backend is currently running as root (PID 22119). You need to stop it:

```bash
cd /home/tony/zonke-clubs/backend
sudo pkill -9 -f "mix phx.server"
```

### 2. Start Backend as Your User

```bash
cd /home/tony/zonke-clubs/backend
mix phx.server
```

### 3. Verify Backend is Listening on All Interfaces

Open a new terminal and run:

```bash
ss -tlnp | grep 4000
```

You should see:

```
LISTEN 0  1024  0.0.0.0:4000  0.0.0.0:*
```

NOT:

```
LISTEN 0  1024  127.0.0.1:4000  0.0.0.0:*
```

### 4. Test Backend from Network

```bash
curl http://192.168.1.139:4000/api/register
```

You should get a response (even if it's an error, it means the server is reachable).

### 5. Restart Mobile App

- Close the app completely on your device
- Reopen it
- Try signing up again

## Verification

When you start the mobile app, check the Metro bundler console for:

```
API URL configured: http://192.168.1.139:4000/api Platform: ios
```

or

```
API URL configured: http://192.168.1.139:4000/api Platform: android
```

## If Your IP Changes

If your computer's IP address changes (e.g., you connect to a different WiFi network):

1. Find your new IP:

```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

2. Update in `frontend/zonke-clubs/services/api.ts`:

```typescript
const LOCAL_IP = "YOUR_NEW_IP_HERE";
```

## Important Notes

- **Same Network**: Ensure your phone and computer are on the same WiFi network
- **Firewall**: Make sure your firewall allows connections on port 4000
- **Backend Running**: The backend must be running as YOUR user, not as root
