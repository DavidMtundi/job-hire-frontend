# Debug: "Not Authenticated" Error in AI Job Generation

## Issue
User clicks "Generate with AI" button and gets "Not Authenticated" error.

## Root Cause Analysis

### Authentication Flow:
1. User logs in → Backend returns `{ access_token, refresh_token, user }`
2. NextAuth `authorize` callback converts to: `{ tokens: { accessToken, refreshToken, userId } }`
3. JWT callback stores: `token.tokens = tokens` (line 151)
4. Session callback returns: `session.tokens = token.tokens` (line 169)
5. Frontend axios tries to get: `session?.tokens?.accessToken` (line 54)

### Potential Issues:

**Issue 1: Token Not in Session**
- The session might not be properly refreshed after login
- The token might be stored but not accessible via `/api/auth/session`
- NextAuth might not be returning tokens in the session

**Issue 2: Timing Issue**
- Token might not be available immediately after login
- Session might need to be refreshed

**Issue 3: Session Structure Mismatch**
- The session API might return a different structure than expected
- The `tokens` object might not be at the expected path

## Debugging Steps Added:

1. **Enhanced Token Retrieval Logging** (`axios.ts`)
   - Logs session structure when token is missing
   - Shows what keys are available in session
   - Logs token presence/absence

2. **Request Interceptor Logging**
   - Logs when token is attached to requests
   - Logs when token is missing (but still sends request)

## Next Steps to Debug:

1. Open browser DevTools → Console
2. Try the AI generation feature
3. Look for console logs showing:
   - Session structure
   - Token presence/absence
   - Request details

## Expected Console Output:

If token is missing, you should see:
```
No access token found in session! {
  sessionKeys: [...],
  tokens: null or undefined,
  isAuthenticated: true/false
}
```

If token is present:
```
[API Request] POST /jobs/ai-generate - Token attached
```

