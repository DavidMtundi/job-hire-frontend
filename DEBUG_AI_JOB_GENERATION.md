# Debugging AI Job Generation - Breakpoint Guide

## Overview

This guide explains how to use the debug breakpoints added to the AI Job Generation feature for step-by-step debugging.

## 🔍 Breakpoint Locations

### **AI Dialog Component** (`ai-job-generation-dialog.tsx`)

1. **BREAKPOINT 1**: `handleGenerate()` function entry
   - Check: `prompt`, `language`, `isPending` state
   - Inspect: Component state variables

2. **BREAKPOINT 2**: Empty prompt validation
   - Triggered when: User tries to generate with empty prompt
   - Check: `prompt.trim()` value

3. **BREAKPOINT 3**: Before API call
   - Triggered: After validation passes
   - Check: `generateJob` mutation function is available
   - Verify: Request payload structure

4. **BREAKPOINT 4**: Success handler
   - Triggered: When API call succeeds
   - Inspect: `response.data` structure
   - Check: What data is being passed to `onJobGenerated`

5. **BREAKPOINT 5**: Error handler
   - Triggered: When API call fails
   - Inspect: `error` object structure
   - Check: `error.response.status`, `error.response.data`
   - Verify: Error message extraction

6. **BREAKPOINT 6**: After mutation call
   - Verify: Mutation was actually triggered
   - Check: No immediate errors

7. **BREAKPOINT 7**: Textarea keydown event
   - Triggered: When any key is pressed in textarea
   - Inspect: `e.key`, `e.shiftKey`, `e.target`

8. **BREAKPOINT 8**: Enter key pressed (without Shift)
   - Check: Event prevention working
   - Verify: `e.preventDefault()` and `e.stopPropagation()` called

9. **BREAKPOINT 9**: Conditions met for Enter key generation
   - Triggered: When Enter pressed and prompt is valid
   - Verify: `prompt.trim()` and `!isPending`

10. **BREAKPOINT 10**: Enter key but conditions not met
    - Triggered: When Enter pressed but prompt empty or pending
    - Check: Why conditions failed

11. **BREAKPOINT 11**: Generate button clicked
    - Check: Button state (`isPending`, `prompt.trim()`)
    - Verify: Button handler execution

12. **BREAKPOINT 12**: Form submission event
    - Triggered: When form is submitted (Enter or button click)
    - Verify: `e.preventDefault()` is called

13. **BREAKPOINT 13**: Form submission conditions met
    - Verify: Ready to call `handleGenerate()`

14. **BREAKPOINT 14**: Form submission blocked
    - Check: Why submission was prevented

15. **BREAKPOINT 15**: Form-level keydown event
    - Backup handler for Enter key

16. **BREAKPOINT 16**: Enter key on form level (textarea)
    - Secondary Enter key handler

### **Mutation Function** (`apis/jobs/queries.ts`)

17. **BREAKPOINT 17**: Mutation function entry
    - Inspect: Request `data` object
    - Check: `text`, `language`, `save` fields

18. **BREAKPOINT 18**: Before API call
    - Verify: Request data is correct
    - Check: `apiClient` is available

19. **BREAKPOINT 19**: API call successful
    - Inspect: Full `response` object
    - Check: `response.status`, `response.data`, `response.headers`
    - Verify: Response structure matches expected format

20. **BREAKPOINT 20**: API call failed
    - Inspect: Error object details
    - Check: Network error vs HTTP error
    - Verify: Error structure

21. **BREAKPOINT 21**: Mutation onError handler
    - Final error handling point
    - Check: Error propagation

### **Axios Interceptor** (`lib/axios.ts`)

22. **BREAKPOINT 22**: Request interceptor for AI endpoint
    - Triggered: When `/jobs/ai-generate` request is intercepted
    - Inspect: Initial request config
    - Check: URL, method, baseURL, data

23. **BREAKPOINT 23**: Before token retrieval
    - Verify: Endpoint is not public
    - Check: Ready to fetch token

24. **BREAKPOINT 24**: After token retrieval
    - Inspect: Token value (preview only)
    - Check: Token is not null/undefined

25. **BREAKPOINT 25**: Token attached successfully
    - Verify: `Authorization` header is set
    - Check: Header format is correct (`Bearer <token>`)

26. **BREAKPOINT 26**: No token available
    - **CRITICAL**: This means authentication failed
    - Investigate: Why token retrieval returned null
    - Check: Session state, NextAuth configuration

27. **BREAKPOINT 27**: Request config finalized
    - Inspect: Final request configuration
    - Verify: Headers, URL, method, body are correct
    - **LAST CHANCE** to check before network request

28. **BREAKPOINT 28**: Request interceptor error
    - Rare: Only if interceptor itself throws an error
    - Investigate: Interceptor implementation issues

29. **BREAKPOINT 29**: Successful response from AI endpoint
    - Inspect: Response data structure
    - Check: Status code, response body
    - Verify: Response matches expected format

30. **BREAKPOINT 30**: Error response from AI endpoint
    - Inspect: Error response details
    - Check: Status code (401, 403, 500, etc.)
    - Verify: Error message and data

### **Token Retrieval** (`lib/axios.ts`)

31. **BREAKPOINT 31**: Token retrieval function entry
    - Check: Execution context (client vs server)

32. **BREAKPOINT 32**: Server-side token retrieval
    - For Next.js API routes
    - Inspect: Server-side session

33. **BREAKPOINT 33**: Client-side token retrieval
    - Most common path
    - Check: Browser context

34. **BREAKPOINT 34**: Session retrieved
    - **CRITICAL**: Inspect full `session` object
    - Check: `session.tokens`, `session.tokens.accessToken`
    - Verify: Session structure matches expected format

35. **BREAKPOINT 35**: Token extracted from session
    - Inspect: Token value (first 20 chars only for security)
    - Verify: Token is not null

36. **BREAKPOINT 36**: No token found
    - **CRITICAL**: Session exists but no token
    - Investigate: Why `session.tokens.accessToken` is undefined
    - Check: NextAuth JWT callback, session callback

## 🛠️ How to Use Breakpoints

### Step 1: Open Browser DevTools

- **Chrome/Edge**: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Safari**: Enable Developer menu first, then `Cmd+Option+I`

### Step 2: Navigate to Sources Tab

1. Click on **Sources** tab in DevTools
2. Enable **"Pause on exceptions"** (optional, but helpful)
   - Click the pause icon with exclamation mark

### Step 3: Test the Feature

1. Navigate to `/admin/jobs/create`
2. Click "Create Job via AI" button
3. Enter a prompt in the textarea
4. Press Enter or click "Generate Job"

### Step 4: When Breakpoint Pauses

Execution will pause at each `debugger;` statement. You can:

1. **Inspect Variables**:
   - Look at **Scope** panel on the right
   - Check **Local**, **Closure**, **Global** scopes
   - Hover over variables in the code to see their values

2. **Step Through Code**:
   - **F8** or **▶️ Continue**: Resume execution until next breakpoint
   - **F10** or **⏭️ Step Over**: Execute current line, don't enter functions
   - **F11** or **⬇️ Step Into**: Enter into function calls
   - **Shift+F11** or **⏫ Step Out**: Exit current function
   - **Ctrl+Shift+F8** or **⏸️ Pause**: Pause on next statement

3. **Watch Expressions**:
   - Click **Watch** panel
   - Add expressions like: `prompt`, `session?.tokens?.accessToken`, `error?.response?.status`
   - See values update as you step through

4. **Console Commands**:
   - Type in console: `prompt`, `session`, `error`, etc.
   - Execute commands in current scope context
   - Call functions: `getAccessToken()`, etc.

### Step 5: Conditional Breakpoints

You can add conditional breakpoints in DevTools:

1. Right-click on a line number
2. Select **"Add conditional breakpoint"**
3. Enter condition, e.g.:
   - `prompt.includes("developer")`
   - `error?.response?.status === 401`
   - `!session?.tokens?.accessToken`

## 🔍 Debugging Checklist

### Authentication Issues (401 Unauthorized)

Check these breakpoints in order:
1. **BREAKPOINT 34**: Session retrieved - Does session exist?
2. **BREAKPOINT 35**: Token extracted - Is token present?
3. **BREAKPOINT 24**: After token retrieval - Is token null?
4. **BREAKPOINT 25/26**: Token attachment - Was token attached?
5. **BREAKPOINT 27**: Final config - Check Authorization header
6. **BREAKPOINT 30**: Error response - What error did backend return?

### Form Submission Issues

Check these breakpoints:
1. **BREAKPOINT 7**: Keydown event - Is event firing?
2. **BREAKPOINT 8**: Enter key - Is it being caught?
3. **BREAKPOINT 12**: Form submit - Is form submitting?
4. **BREAKPOINT 1**: handleGenerate - Is function being called?

### API Call Issues

Check these breakpoints:
1. **BREAKPOINT 17**: Mutation entry - Is mutation function called?
2. **BREAKPOINT 22**: Interceptor - Is request being intercepted?
3. **BREAKPOINT 27**: Final config - Is request config correct?
4. **BREAKPOINT 19/20**: Response - Success or error?

## 💡 Tips

1. **Enable "Preserve log"** in Console tab to keep logs across navigation
2. **Use Network tab** alongside Sources to see actual HTTP requests
3. **Check Application tab** → Storage → Session Storage for NextAuth session
4. **Use React DevTools** to inspect component state alongside code breakpoints
5. **Disable breakpoints temporarily** by clicking the breakpoint icon (blue dot)

## 🚨 Removing Breakpoints for Production

Before deploying to production, remove all `debugger;` statements or wrap them:

```typescript
if (process.env.NODE_ENV === "development") {
  debugger;
}
```

Or create a script to remove them automatically.

## 📝 Common Issues to Look For

1. **Token is null at BREAKPOINT 35**: 
   - NextAuth session not properly configured
   - JWT callback not storing tokens correctly
   - Session expired or invalid

2. **Request doesn't reach BREAKPOINT 22**:
   - API call not being made
   - Wrong URL or endpoint
   - Component not rendering correctly

3. **401 at BREAKPOINT 30**:
   - Token not attached (check BREAKPOINT 26)
   - Token expired
   - Backend rejecting token format

4. **Form submission doesn't trigger BREAKPOINT 12**:
   - Event handlers not properly attached
   - Event being prevented elsewhere
   - Component not properly mounted
